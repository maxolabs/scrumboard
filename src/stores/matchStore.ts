import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { safeInsert, safeUpdate, deleteFromQueue } from '@/lib/offlineQueue'
import type { Match, MatchEvent, MatchHalf, MatchStatus, EventTeam, EventOutcome } from '@/lib/types'
import { POINTS_MAP } from '@/lib/constants'
import { formatMatchMinute } from '@/lib/utils'

function computeElapsed(match: Pick<Match, 'current_half' | 'first_half_seconds' | 'second_half_seconds' | 'timer_running' | 'timer_started_at'>): number {
  const baseElapsed = match.current_half === 'first'
    ? match.first_half_seconds
    : match.second_half_seconds

  if (!match.timer_running || !match.timer_started_at) return baseElapsed

  const startedAtMs = new Date(match.timer_started_at).getTime()
  if (Number.isNaN(startedAtMs)) return baseElapsed

  const deltaSeconds = Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000))
  return baseElapsed + deltaSeconds
}

function activeHalfField(half: MatchHalf) {
  return half === 'first' ? 'first_half_seconds' : 'second_half_seconds'
}

interface MatchState {
  match: Match | null
  events: MatchEvent[]
  elapsedSeconds: number
  timerRunning: boolean
  intervalId: ReturnType<typeof setInterval> | null
  lastPersist: number

  loadMatch: (id: string) => Promise<void>
  startTimer: () => void
  pauseTimer: () => Promise<void>
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

    const typedMatch = match as Match
    const elapsed = computeElapsed(typedMatch)

    let intervalId: ReturnType<typeof setInterval> | null = null
    if (typedMatch.timer_running) {
      intervalId = setInterval(() => {
        const s = get()
        if (!s.match) return
        const newElapsed = computeElapsed(s.match)
        set({ elapsedSeconds: newElapsed })

        if (newElapsed - s.lastPersist >= 30) {
          void get().persistTimer()
        }
      }, 1000)
    }

    set({
      match: typedMatch,
      events: (events ?? []) as MatchEvent[],
      elapsedSeconds: elapsed,
      timerRunning: typedMatch.timer_running,
      intervalId,
      lastPersist: typedMatch[activeHalfField(typedMatch.current_half)],
    })
  },

  startTimer: () => {
    const state = get()
    if (state.timerRunning || !state.match) return

    const startedAt = new Date().toISOString()
    const currentElapsed = computeElapsed(state.match)
    const field = activeHalfField(state.match.current_half)

    const nextStatus: MatchStatus =
      state.match.status === 'pending' || state.match.status === 'half_time'
        ? (state.match.current_half === 'first' ? 'first_half' : 'second_half')
        : state.match.status

    const nextMatch: Match = {
      ...state.match,
      [field]: currentElapsed,
      timer_running: true,
      timer_started_at: startedAt,
      status: nextStatus,
      updated_at: startedAt,
    }

    const intervalId = setInterval(() => {
      const s = get()
      if (!s.match) return
      const newElapsed = computeElapsed(s.match)
      set({ elapsedSeconds: newElapsed })

      if (newElapsed - s.lastPersist >= 30) {
        void get().persistTimer()
      }
    }, 1000)

    set({
      match: nextMatch,
      elapsedSeconds: currentElapsed,
      timerRunning: true,
      intervalId,
      lastPersist: currentElapsed,
    })

    void safeUpdate('matches', {
      [field]: currentElapsed,
      timer_running: true,
      timer_started_at: startedAt,
      status: nextStatus,
      updated_at: startedAt,
    }, { id: state.match.id })
  },

  pauseTimer: async () => {
    const state = get()
    if (!state.match) return

    if (state.intervalId) clearInterval(state.intervalId)

    const currentElapsed = computeElapsed(state.match)
    const field = activeHalfField(state.match.current_half)
    const updatedAt = new Date().toISOString()

    const nextMatch: Match = {
      ...state.match,
      [field]: currentElapsed,
      timer_running: false,
      timer_started_at: null,
      updated_at: updatedAt,
    }

    set({
      match: nextMatch,
      elapsedSeconds: currentElapsed,
      timerRunning: false,
      intervalId: null,
      lastPersist: currentElapsed,
    })

    await safeUpdate('matches', {
      [field]: currentElapsed,
      timer_running: false,
      timer_started_at: null,
      updated_at: updatedAt,
    }, { id: state.match.id })
  },

  persistTimer: async () => {
    const { match } = get()
    if (!match) return

    const currentElapsed = computeElapsed(match)
    const field = activeHalfField(match.current_half)
    const updatedAt = new Date().toISOString()

    const nextMatch: Match = match.timer_running
      ? {
          ...match,
          [field]: currentElapsed,
          timer_started_at: updatedAt,
          updated_at: updatedAt,
        }
      : {
          ...match,
          [field]: currentElapsed,
          updated_at: updatedAt,
        }

    set({
      match: nextMatch,
      elapsedSeconds: currentElapsed,
      lastPersist: currentElapsed,
    })

    await safeUpdate('matches', {
      [field]: currentElapsed,
      ...(match.timer_running ? { timer_started_at: updatedAt } : {}),
      updated_at: updatedAt,
    }, { id: match.id })
  },

  switchHalf: async () => {
    const state = get()
    if (!state.match) return

    if (state.intervalId) clearInterval(state.intervalId)

    const currentElapsed = computeElapsed(state.match)
    const currentField = activeHalfField(state.match.current_half)
    const newHalf: MatchHalf = 'second'
    const newStatus: MatchStatus = 'half_time'
    const updatedAt = new Date().toISOString()

    await safeUpdate('matches', {
      [currentField]: currentElapsed,
      current_half: newHalf,
      status: newStatus,
      timer_running: false,
      timer_started_at: null,
      updated_at: updatedAt,
    }, { id: state.match.id })

    set(s => ({
      match: s.match ? {
        ...s.match,
        [currentField]: currentElapsed,
        current_half: newHalf,
        status: newStatus,
        timer_running: false,
        timer_started_at: null,
        updated_at: updatedAt,
      } : null,
      elapsedSeconds: s.match?.second_half_seconds ?? 0,
      timerRunning: false,
      intervalId: null,
      lastPersist: s.match?.second_half_seconds ?? 0,
    }))
  },

  finishMatch: async () => {
    const state = get()
    if (!state.match) return

    if (state.intervalId) clearInterval(state.intervalId)

    const currentElapsed = computeElapsed(state.match)
    const field = activeHalfField(state.match.current_half)
    const updatedAt = new Date().toISOString()

    await safeUpdate('matches', {
      [field]: currentElapsed,
      status: 'finished' as MatchStatus,
      timer_running: false,
      timer_started_at: null,
      updated_at: updatedAt,
    }, { id: state.match.id })

    set(s => ({
      match: s.match ? {
        ...s.match,
        [field]: currentElapsed,
        status: 'finished',
        timer_running: false,
        timer_started_at: null,
        updated_at: updatedAt,
      } : null,
      elapsedSeconds: currentElapsed,
      timerRunning: false,
      intervalId: null,
      lastPersist: currentElapsed,
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
    })
  },
}))
