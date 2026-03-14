import type { ButtonConfig } from './types'

export const POINTS_MAP: Record<string, number> = {
  try: 5,
  conversion: 2,
  penalty_kick: 3,
  drop_goal: 3,
}

export const CATEGORY_LABELS: Record<string, string> = {
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
  obs_attack: 'Ataque',
  obs_defense: 'Defensa',
  obs_skills: 'Destrezas',
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

export const CUSTOM_BUTTON_COLOR_OPTIONS = [
  { value: 'default', label: 'Neutral' },
  { value: 'blue', label: 'Azul suave' },
  { value: 'amber', label: 'Ámbar suave' },
  { value: 'violet', label: 'Violeta suave' },
  { value: 'teal', label: 'Verde azulado' },
] as const

export const DEFAULT_BUTTONS: ButtonConfig[] = [
  // Scoring — single buttons, team selected via popup
  { id: 'try', category: 'try', label: 'Try', type: 'scoring', color: 'score', visible: true, points: 5 },
  { id: 'conversion', category: 'conversion', label: 'Conversión', type: 'scoring', color: 'score', visible: true, points: 2 },
  { id: 'penalty-kick', category: 'penalty_kick', label: 'Penal (gol)', type: 'scoring', color: 'score', visible: true, points: 3 },
  { id: 'drop-goal', category: 'drop_goal', label: 'Drop', type: 'scoring', color: 'score', visible: true, points: 3 },
  // Penalties (infractions, no points)
  { id: 'pen-for', category: 'penalty_for', label: 'Penal a Favor', type: 'penalty', color: 'penalty_for', visible: true, team: 'ours' },
  { id: 'pen-against', category: 'penalty_against', label: 'Penal en Contra', type: 'penalty', color: 'penalty_against', visible: true, team: 'theirs' },
  // Set pieces — team+outcome selected via dialog
  { id: 'scrum', category: 'scrum', label: 'Scrum', type: 'set_piece', color: 'default', visible: true },
  { id: 'lineout', category: 'lineout', label: 'Line', type: 'set_piece', color: 'default', visible: true },
  { id: 'ruck', category: 'ruck', label: 'Ruck', type: 'set_piece', color: 'default', visible: true },
  { id: 'maul', category: 'maul', label: 'Maul', type: 'set_piece', color: 'default', visible: true },
  // Observations — restrained by default
  { id: 'obs-attack', category: 'obs_attack', label: 'Ataque', type: 'observation', color: 'default', visible: true },
  { id: 'obs-defense', category: 'obs_defense', label: 'Defensa', type: 'observation', color: 'default', visible: true },
  { id: 'obs-skills', category: 'obs_skills', label: 'Destrezas', type: 'observation', color: 'default', visible: true },
  { id: 'obs-general', category: 'obs_general', label: 'Obs. General', type: 'observation', color: 'default', visible: true },
  { id: 'obs-player', category: 'obs_player', label: 'Obs. Jugador', type: 'observation', color: 'default', visible: true },
]
