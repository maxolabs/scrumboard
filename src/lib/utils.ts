import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { MatchEvent, EventTeam, ButtonConfig } from './types'
import { CATEGORY_LABELS } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function formatMatchMinute(seconds: number): number {
  return Math.floor(seconds / 60)
}

export function eventLabel(event: MatchEvent): string {
  const cat = CATEGORY_LABELS[event.category] || event.category
  const teamSuffix = event.team === 'ours' ? ' (N)' : event.team === 'theirs' ? ' (R)' : ''
  return `${cat}${teamSuffix}`
}

export function countEvents(
  events: MatchEvent[],
  category: string,
  team?: EventTeam,
  outcome?: string,
): number {
  return events.filter(e => {
    if (e.category !== category) return false
    if (team && e.team !== team) return false
    if (outcome && e.outcome !== outcome) return false
    return true
  }).length
}

export function getObservationNotes(
  events: MatchEvent[],
  category: string,
): string[] {
  return events
    .filter(e => e.category === category && e.notes)
    .map(e => e.notes)
}

export function getSetPieceStats(events: MatchEvent[], category: string) {
  const ours = events.filter(e => e.category === category && e.team === 'ours')
  const theirs = events.filter(e => e.category === category && e.team === 'theirs')
  return {
    thrown: ours.length,
    lost: ours.filter(e => e.outcome === 'lost').length,
    stolen: theirs.filter(e => e.outcome === 'won').length,
    stolenTotal: theirs.length,
    penaltyFor: events.filter(e => e.category === category && e.outcome === 'penalty_for').length,
    penaltyAgainst: events.filter(e => e.category === category && e.outcome === 'penalty_against').length,
  }
}

export function getButtonToneClass(button: Pick<ButtonConfig, 'color' | 'type'>) {
  switch (button.color) {
    case 'score':
      return 'bg-emerald-500/14 text-emerald-100 border border-emerald-400/20 hover:bg-emerald-500/20'
    case 'penalty_for':
      return 'bg-green-500/14 text-green-100 border border-green-400/20 hover:bg-green-500/20'
    case 'penalty_against':
      return 'bg-rose-500/14 text-rose-100 border border-rose-400/20 hover:bg-rose-500/20'
    case 'blue':
      return 'bg-sky-500/14 text-sky-100 border border-sky-400/20 hover:bg-sky-500/20'
    case 'amber':
      return 'bg-amber-500/14 text-amber-100 border border-amber-400/20 hover:bg-amber-500/20'
    case 'violet':
      return 'bg-violet-500/14 text-violet-100 border border-violet-400/20 hover:bg-violet-500/20'
    case 'teal':
      return 'bg-teal-500/14 text-teal-100 border border-teal-400/20 hover:bg-teal-500/20'
    default:
      return 'bg-secondary text-foreground border border-border hover:bg-accent'
  }
}
