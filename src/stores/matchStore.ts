import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { safeInsert, safeUpdate, deleteFromQueue } from '@/lib/offlineQueue'
import type { Match, MatchEvent, MatchHalf, MatchStatus, EventTeam, EventOutcome } from '@/lib/types'
import { POINTS_MAP } from '@/lib/constants'
import { formatMatchMinute } from '@/lib/utils'

const TIMER_STORAGE_PREFIX = 'scrumboard:match-timer'

type TimerSnapshot = {
  matchId: string
  half: MatchHalf
  baseElapsedSeconds: number
  startedAt: number
  running: boolean
}

function timerStorageKey(matchId: string) {
  return `${TIMER_STORAGE_PREFIX}:${matchId}`
}

function readTimerSnapshot(matchId: string): TimerSnapshot | null {
  try {
    const raw = localStorage.getItem(timerStorageKey(matchId))
    if (!raw) return null
    return JSON.parse(raw) as TimerSnapshot
  } catch {
    return null
  }
}

function writeTimerSnapshot(snapshot: TimerSnapshot) {
  try {
    localStorage.setItem(timerStorageKey(snapshot.matchId), JSON.stringify(snapshot))
  } catch {
    // ignore storage failures
  }
}

function clearTimerSnapshot(matchId: string) {
  try {
    localStorage.removeItem(timerStorageKey(matchId))
  } catch {
    // ignore storage failures
  }
}

function computeElapsed(baseElapsedSeconds: number, startedAt: number | null) {
  if (!startedAt) return baseElapsedSeconds
  const delta = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
  return baseElapsedSeconds + delta
}

interface MatchState {
  match: Match | null
  events: MatchEvent[]
  elapsedSeconds: number
  timerRunning: boolean
  intervalId: ReturnType<typeof setInterval> | null
  lastPersist: number
  runStartedAt: number | null
  runBaseElapsedSeconds: number

  loadMatch: (id: string) => Promise<void>
  startTimer: () => void
  pauseTimer: () => void
  switchHalf: () => Promise<void>
  finishMatch: () => Promise<void>
  addEvent: (params: {
    category: string
    team?: EventTeam | null
    outcome?: EventOutcome | null
    points?: number
    playerNumber?: number | null
    notes?: string
  }) => Promise<void>
  deleteEvent: (eventId: string) => Promise<void>
  updateNotes: (notes: string) => Promise<void>
  persistTimer: () => Promise<void>
  cleanup: () => void
}

export const useMatchStore = create<MatchState>((set, get) => ({
  match: null,
  events: [],
  elapsedSeconds: 0,
  timerRunning: false,
  intervalId: null,
  lastPersist: 0,
  runStartedAt: null,
  runBaseElapsedSeconds: 0,

  loadMatch: async (id) => {
    const { data: match } = await supabase
      .from('matches')
      .select('*, team:teams(*)')
      .eq('id', id)
      .single()
    if (!match) return

    const { data: events } = await supabase
      .from('match_events')
      .select('*')
      .eq('match_id', id)
      .order('created_at', { ascending: true })

    const elapsed = match.current_half === 'first'
      ? match.first_half_seconds
      : match.second_half_seconds

    const typedMatch = match as Match
    const snapshot = readTimerSnapshot(typedMatch.id)
    const canResumeFromSnapshot = Boolean(
      snapshot &&
      snapshot.running &&
      snapshot.half === typedMatch.current_half &&
      (typedMatch.status === 'first_half' || typedMatch.status === 'second_half')
    )

    if (canResumeFromSnapshot && snapshot) {
      const intervalId = setInterval(() => {
        const s = get()
        const newElapsed = computeElapsed(s.runBaseElapsedSeconds, s.runStartedAt)
        set({ elapsedSeconds: newElapsed })

        if (newElapsed - s.lastPersist >= 30) {
          get().persistTimer()
        }
      }, 1000)

      const resumedBaseElapsed = Math.max(elapsed, snapshot.baseElapsedSeconds)
      const resumedElapsed = computeElapsed(resumedBaseElapsed, snapshot.startedAt)
      set({
        match: typedMatch,
        events: (events ?? []) as MatchEvent[],
        elapsedSeconds: resumedElapsed,
        timerRunning: true,
        intervalId,
        runStartedAt: snapshot.startedAt,
        runBaseElapsedSeconds: resumedBaseElapsed,
        lastPersist: elapsed,
      })
      return
    }

    clearTimerSnapshot(typedMatch.id)
    set({
      match: typedMatch,
      events: (events ?? []) as MatchEvent[],
      elapsedSeconds: elapsed,
      timerRunning: false,
      runStartedAt: null,
      runBaseElapsedSeconds: elapsed,
      lastPersist: elapsed,
    })
  },

  startTimer: () => {
    const state = get()
    if (state.timerRunning || !state.match) return

    const startedAt = Date.now()
    const baseElapsedSeconds = state.elapsedSeconds

    // Auto-advance status if pending
    const { match } = state
    if (match.status === 'pending' || match.status === 'half_time') {
      const newStatus: MatchStatus = match.current_half === 'first' ? 'first_half' : 'second_half'
      safeUpdate('matches', { status: newStatus, updated_at: new Date().toISOString() }, { id: match.id })
        .then(() => {
          set(s => ({ match: s.match ? { ...s.match, status: newStatus } : null }))
        })
    }

    writeTimerSnapshot({
      matchId: match.id,
      half: match.current_half,
      baseElapsedSeconds,
      startedAt,
      running: true,
    })

    const intervalId = setInterval(() => {
      const s = get()
      const newElapsed = computeElapsed(s.runBaseElapsedSeconds, s.runStartedAt)
      set({ elapsedSeconds: newElapsed })

      // Persist every 30 seconds
      if (newElapsed - s.lastPersist >= 30) {
        get().persistTimer()
      }
    }, 1000)

    set({ timerRunning: true, intervalId, runStartedAt: startedAt, runBaseElapsedSeconds: baseElapsedSeconds })
  },

  pauseTimer: () => {
    const { intervalId, match, runBaseElapsedSeconds, runStartedAt } = get()
    if (intervalId) clearInterval(intervalId)
    const finalElapsed = computeElapsed(runBaseElapsedSeconds, runStartedAt)
    if (match) clearTimerSnapshot(match.id)
    set({ timerRunning: false, intervalId: null, elapsedSeconds: finalElapsed, runStartedAt: null, runBaseElapsedSeconds: finalElapsed })
    get().persistTimer()
  },

  persistTimer: async () => {
    const { match, elapsedSeconds, timerRunning, runBaseElapsedSeconds, runStartedAt } = get()
    if (!match) return

    const currentElapsed = timerRunning ? computeElapsed(runBaseElapsedSeconds, runStartedAt) : elapsedSeconds
    const field = match.current_half === 'first' ? 'first_half_seconds' : 'second_half_seconds'
    await safeUpdate('matches', { [field]: currentElapsed, updated_at: new Date().toISOString() }, { id: match.id })

    if (timerRunning && runStartedAt) {
      const restartedAt = Date.now()
      writeTimerSnapshot({
        matchId: match.id,
        half: match.current_half,
        baseElapsedSeconds: currentElapsed,
        startedAt: restartedAt,
        running: true,
      })
      set({ lastPersist: currentElapsed, elapsedSeconds: currentElapsed, runBaseElapsedSeconds: currentElapsed, runStartedAt: restartedAt })
      return
    }

    set({ lastPersist: currentElapsed, elapsedSeconds: currentElapsed, runBaseElapsedSeconds: currentElapsed })
  },

  switchHalf: async () => {
    const state = get()
    if (!state.match) return

    // Pause first
    if (state.timerRunning) {
      const { intervalId } = state
      if (intervalId) clearInterval(intervalId)
      clearTimerSnapshot(state.match.id)
    }

    // Persist current half time
    await get().persistTimer()

    const newHalf: MatchHalf = 'second'
    const newStatus: MatchStatus = 'half_time'

    await safeUpdate('matches', {
      current_half: newHalf,
      status: newStatus,
      updated_at: new Date().toISOString(),
    }, { id: state.match.id })

    set(s => ({
      match: s.match ? { ...s.match, current_half: newHalf, status: newStatus } : null,
      elapsedSeconds: s.match?.second_half_seconds ?? 0,
      timerRunning: false,
      intervalId: null,
      runStartedAt: null,
      runBaseElapsedSeconds: s.match?.second_half_seconds ?? 0,
      lastPersist: s.match?.second_half_seconds ?? 0,
    }))
  },

  finishMatch: async () => {
    const state = get()
    if (!state.match) return

    if (state.timerRunning) {
      const { intervalId } = state
      if (intervalId) clearInterval(intervalId)
      clearTimerSnapshot(state.match.id)
    }
    await get().persistTimer()

    await safeUpdate('matches', { status: 'finished' as MatchStatus, updated_at: new Date().toISOString() }, { id: state.match.id })

    set(s => ({
      match: s.match ? { ...s.match, status: 'finished' } : null,
      timerRunning: false,
      intervalId: null,
      runStartedAt: null,
      runBaseElapsedSeconds: s.elapsedSeconds,
    }))
  },

  addEvent: async ({ category, team, outcome, points, playerNumber, notes }) => {
    const { match, elapsedSeconds } = get()
    if (!match) return

    const eventPoints = points ?? POINTS_MAP[category] ?? 0

    const newEvent: Partial<MatchEvent> = {
      match_id: match.id,
      category,
      team: team ?? null,
      outcome: outcome ?? null,
      half: match.current_half,
      match_minute: formatMatchMinute(elapsedSeconds),
      points: eventPoints,
      player_number: playerNumber ?? null,
      notes: notes ?? '',
    }

    const { data } = await safeInsert('match_events', newEvent)

    // Optimistic score update
    set(s => {
      const events = [...s.events, data as MatchEvent]
      let homeScore = s.match?.home_score ?? 0
      let awayScore = s.match?.away_score ?? 0

      if (eventPoints > 0 && team) {
        const isOursHome = match.is_home
        if (team === 'ours') {
          if (isOursHome) homeScore += eventPoints
          else awayScore += eventPoints
        } else {
          if (isOursHome) awayScore += eventPoints
          else homeScore += eventPoints
        }
      }

      return {
        events,
        match: s.match ? { ...s.match, home_score: homeScore, away_score: awayScore } : null,
      }
    })
  },

  deleteEvent: async (eventId) => {
    const { match } = get()
    if (!match) return

    // Local-only event: remove from queue and local state
    if (eventId.startsWith('local-')) {
      await deleteFromQueue(eventId)
      const deleted = get().events.find(e => e.id === eventId)
      set(s => {
        let homeScore = s.match?.home_score ?? 0
        let awayScore = s.match?.away_score ?? 0
        if (deleted && deleted.points > 0 && deleted.team) {
          const isOursHome = match.is_home
          if (deleted.team === 'ours') {
            if (isOursHome) homeScore -= deleted.points
            else awayScore -= deleted.points
          } else {
            if (isOursHome) awayScore -= deleted.points
            else homeScore -= deleted.points
          }
        }
        return {
          events: s.events.filter(e => e.id !== eventId),
          match: s.match ? { ...s.match, home_score: homeScore, away_score: awayScore } : null,
        }
      })
      return
    }

    await supabase.from('match_events').delete().eq('id', eventId)

    // Reload scores from server after delete
    const { data: refreshed } = await supabase
      .from('matches')
      .select('home_score, away_score')
      .eq('id', match.id)
      .single()

    set(s => ({
      events: s.events.filter(e => e.id !== eventId),
      match: s.match && refreshed
        ? { ...s.match, home_score: refreshed.home_score, away_score: refreshed.away_score }
        : s.match,
    }))
  },

  updateNotes: async (notes) => {
    const { match } = get()
    if (!match) return
    await safeUpdate('matches', { notes, updated_at: new Date().toISOString() }, { id: match.id })
    set(s => ({ match: s.match ? { ...s.match, notes } : null }))
  },

  cleanup: () => {
    const { intervalId } = get()
    if (intervalId) clearInterval(intervalId)
    set({
      match: null,
      events: [],
      elapsedSeconds: 0,
      timerRunning: false,
      intervalId: null,
      lastPersist: 0,
      runStartedAt: null,
      runBaseElapsedSeconds: 0,
    })
  },
}))
