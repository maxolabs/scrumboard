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
  // Scoring — ours
  { id: 'try-ours', category: 'try', label: 'Try Nuestro', type: 'scoring', color: 'bg-green-600', team: 'ours', points: 5 },
  { id: 'try-theirs', category: 'try', label: 'Try Rival', type: 'scoring', color: 'bg-red-600', team: 'theirs', points: 5 },
  { id: 'conv-ours', category: 'conversion', label: 'Conv. Nuestro', type: 'scoring', color: 'bg-green-500', team: 'ours', points: 2 },
  { id: 'conv-theirs', category: 'conversion', label: 'Conv. Rival', type: 'scoring', color: 'bg-red-500', team: 'theirs', points: 2 },
  { id: 'pk-ours', category: 'penalty_kick', label: 'Penal Nuestro', type: 'scoring', color: 'bg-green-500', team: 'ours', points: 3 },
  { id: 'pk-theirs', category: 'penalty_kick', label: 'Penal Rival', type: 'scoring', color: 'bg-red-500', team: 'theirs', points: 3 },
  { id: 'drop-ours', category: 'drop_goal', label: 'Drop Nuestro', type: 'scoring', color: 'bg-green-500', team: 'ours', points: 3 },
  { id: 'drop-theirs', category: 'drop_goal', label: 'Drop Rival', type: 'scoring', color: 'bg-red-500', team: 'theirs', points: 3 },
  // Penalties
  { id: 'pen-for', category: 'penalty_for', label: 'Penal a Favor', type: 'penalty', color: 'bg-blue-600', team: 'ours' },
  { id: 'pen-against', category: 'penalty_against', label: 'Penal en Contra', type: 'penalty', color: 'bg-orange-600', team: 'theirs' },
  // Set pieces
  { id: 'scrum', category: 'scrum', label: 'Scrum', type: 'set_piece', color: 'bg-purple-600' },
  { id: 'lineout', category: 'lineout', label: 'Line', type: 'set_piece', color: 'bg-purple-500' },
  { id: 'ruck', category: 'ruck', label: 'Ruck', type: 'set_piece', color: 'bg-purple-400' },
  { id: 'maul', category: 'maul', label: 'Maul', type: 'set_piece', color: 'bg-purple-400' },
  // Observations
  { id: 'obs-attack', category: 'obs_attack', label: 'Obs. Ataque', type: 'observation', color: 'bg-yellow-600' },
  { id: 'obs-defense', category: 'obs_defense', label: 'Obs. Defensa', type: 'observation', color: 'bg-yellow-600' },
  { id: 'obs-catch', category: 'obs_skills_catch_pass', label: 'Atrapar/Pasar', type: 'observation', color: 'bg-yellow-500' },
  { id: 'obs-duel', category: 'obs_skills_duel', label: 'Duelo', type: 'observation', color: 'bg-yellow-500' },
  { id: 'obs-tackle', category: 'obs_skills_tackle', label: 'Tackle', type: 'observation', color: 'bg-yellow-500' },
  { id: 'obs-ruck', category: 'obs_skills_ruck', label: 'Ruck (Dest.)', type: 'observation', color: 'bg-yellow-500' },
  { id: 'obs-general', category: 'obs_general', label: 'Obs. General', type: 'observation', color: 'bg-gray-500' },
  { id: 'obs-player', category: 'obs_player', label: 'Obs. Jugador', type: 'observation', color: 'bg-gray-500' },
]
