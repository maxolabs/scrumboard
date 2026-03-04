import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { MatchEvent, EventCategory, EventTeam } from './types'
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
  category: EventCategory,
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
  category: EventCategory,
): string[] {
  return events
    .filter(e => e.category === category && e.notes)
    .map(e => e.notes)
}

export function getSetPieceStats(events: MatchEvent[], category: EventCategory) {
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
