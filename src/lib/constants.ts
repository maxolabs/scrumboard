import type { ButtonConfig, EventCategory } from './types'

export const POINTS_MAP: Partial<Record<EventCategory, number>> = {
  try: 5,
  conversion: 2,
  penalty_kick: 3,
  drop_goal: 3,
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  try: 'Try',
  conversion: 'Conversión',
  penalty_kick: 'Penal',
  drop_goal: 'Drop',
  penalty_for: 'Penal a Favor',
  penalty_against: 'Penal en Contra',
  scrum: 'Scrum',
  lineout: 'Line',
  ruck: 'Ruck',
  maul: 'Maul',
  kickoff: 'Salida',
  kick: 'Kick',
  obs_attack: 'Obs. Ataque',
  obs_defense: 'Obs. Defensa',
  obs_skills_catch_pass: 'Atrapar y Pasar',
  obs_skills_duel: 'Duelo',
  obs_skills_tackle: 'Tackle',
  obs_skills_ruck: 'Ruck (Destreza)',
  obs_general: 'Obs. General',
  obs_player: 'Obs. Jugador',
}

export const TEAM_LABELS = {
  ours: 'Nuestro',
  theirs: 'Rival',
} as const

export const OUTCOME_LABELS = {
  won: 'Ganado',
  lost: 'Perdido',
  penalty_for: 'Penal F',
  penalty_against: 'Penal C',
  neutral: 'Neutral',
} as const

export const HALF_LABELS = {
  first: '1T',
  second: '2T',
} as const

export const TEAM_CATEGORIES = [
  'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M21',
  'Intermedia', 'Primera', 'Femenino', 'Otro',
]

export const DEFAULT_BUTTONS: ButtonConfig[] = [
  // Scoring — single buttons, team selected via popup
  { id: 'try', category: 'try', label: 'Try', type: 'scoring', color: 'default', points: 5 },
  { id: 'conversion', category: 'conversion', label: 'Conversión', type: 'scoring', color: 'default', points: 2 },
  { id: 'penalty-kick', category: 'penalty_kick', label: 'Penal (gol)', type: 'scoring', color: 'default', points: 3 },
  { id: 'drop-goal', category: 'drop_goal', label: 'Drop', type: 'scoring', color: 'default', points: 3 },
  // Penalties (infractions, no points)
  { id: 'pen-for', category: 'penalty_for', label: 'Penal a Favor', type: 'penalty', color: 'default', team: 'ours' },
  { id: 'pen-against', category: 'penalty_against', label: 'Penal en Contra', type: 'penalty', color: 'default', team: 'theirs' },
  // Set pieces — team+outcome selected via dialog
  { id: 'scrum', category: 'scrum', label: 'Scrum', type: 'set_piece', color: 'default' },
  { id: 'lineout', category: 'lineout', label: 'Line', type: 'set_piece', color: 'default' },
  { id: 'ruck', category: 'ruck', label: 'Ruck', type: 'set_piece', color: 'default' },
  { id: 'maul', category: 'maul', label: 'Maul', type: 'set_piece', color: 'default' },
  // Observations — kept minimal
  { id: 'obs-general', category: 'obs_general', label: 'Obs. General', type: 'observation', color: 'default' },
  { id: 'obs-player', category: 'obs_player', label: 'Obs. Jugador', type: 'observation', color: 'default' },
]
