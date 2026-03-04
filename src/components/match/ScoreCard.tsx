import { useMatchStore } from '@/stores/matchStore'
import { HALF_LABELS } from '@/lib/constants'

export function ScoreCard() {
  const match = useMatchStore(s => s.match)
  if (!match) return null

  const teamName = match.team?.name ?? 'Mi equipo'
  const leftName = match.is_home ? teamName : match.opponent_name
  const rightName = match.is_home ? match.opponent_name : teamName

  return (
    <div className="bg-primary text-primary-foreground rounded-lg p-4 text-center">
      <div className="text-xs uppercase tracking-wide mb-1 opacity-80">
        {match.team?.category && `${match.team.category} · `}
        {HALF_LABELS[match.current_half]}
      </div>
      <div className="flex items-center justify-center gap-4">
        <span className="text-sm font-medium truncate max-w-[120px]">{leftName}</span>
        <span className="text-3xl font-bold tabular-nums">
          {match.home_score} - {match.away_score}
        </span>
        <span className="text-sm font-medium truncate max-w-[120px]">{rightName}</span>
      </div>
    </div>
  )
}
