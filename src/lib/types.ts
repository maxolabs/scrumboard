export type MatchStatus = 'pending' | 'first_half' | 'half_time' | 'second_half' | 'finished'
export type MatchHalf = 'first' | 'second'
export type EventTeam = 'ours' | 'theirs'
export type EventCategory =
  | 'try' | 'conversion' | 'penalty_kick' | 'drop_goal'
  | 'penalty_for' | 'penalty_against'
  | 'scrum' | 'lineout' | 'ruck' | 'maul' | 'kickoff' | 'kick'
  | 'obs_attack' | 'obs_defense'
  | 'obs_skills_catch_pass' | 'obs_skills_duel' | 'obs_skills_tackle' | 'obs_skills_ruck'
  | 'obs_general' | 'obs_player'
export type EventOutcome = 'won' | 'lost' | 'penalty_for' | 'penalty_against' | 'neutral'

export interface Profile {
  id: string
  full_name: string
  club_name: string
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  user_id: string
  name: string
  category: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  user_id: string
  team_id: string | null
  opponent_name: string
  is_home: boolean
  match_date: string
  status: MatchStatus
  home_score: number
  away_score: number
  first_half_seconds: number
  second_half_seconds: number
  current_half: MatchHalf
  timer_running: boolean
  timer_started_at: string | null
  notes: string
  created_at: string
  updated_at: string
  // joined
  team?: Team
}

export interface MatchEvent {
  id: string
  match_id: string
  category: string
  team: EventTeam | null
  outcome: EventOutcome | null
  half: MatchHalf
  match_minute: number
  points: number
  player_number: number | null
  notes: string
  created_at: string
}

export type ButtonType = 'scoring' | 'penalty' | 'set_piece' | 'observation' | 'custom_note' | 'custom_team'
export type ButtonColor = 'default' | 'score' | 'penalty_for' | 'penalty_against' | 'blue' | 'amber' | 'violet' | 'teal'

export interface ButtonConfig {
  id: string
  category: string
  label: string
  type: ButtonType
  color: ButtonColor | string
  visible?: boolean
  team?: EventTeam
  points?: number
}

export interface ButtonLayout {
  id: string
  user_id: string
  name: string
  layout: ButtonConfig[]
  is_default: boolean
  created_at: string
  updated_at: string
}
