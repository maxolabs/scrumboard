import { useMatchStore } from '@/stores/matchStore'
import { formatTime } from '@/lib/utils'
import { HALF_LABELS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Play, Pause, ArrowRight, Flag } from 'lucide-react'

export function ScoreCard() {
  const { match, elapsedSeconds, timerRunning, startTimer, pauseTimer, switchHalf, finishMatch } = useMatchStore()
  if (!match) return null

  const teamName = match.team?.name ?? 'Mi equipo'
  const leftName = match.is_home ? teamName : match.opponent_name
  const rightName = match.is_home ? match.opponent_name : teamName
  const isFinished = match.status === 'finished'
  const isFirstHalf = match.current_half === 'first'

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      {/* Score */}
      <div className="px-4 pt-4 pb-2 text-center">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
          {match.team?.category && `${match.team.category} · `}
          {HALF_LABELS[match.current_half]}
        </div>
        <div className="flex items-center justify-center gap-5">
          <div className="flex-1 text-right">
            <p className="text-xs text-muted-foreground truncate">{leftName}</p>
          </div>
          <div className="text-4xl font-extrabold tabular-nums tracking-tight">
            {match.home_score}
            <span className="text-muted-foreground mx-2">:</span>
            {match.away_score}
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs text-muted-foreground truncate">{rightName}</p>
          </div>
        </div>
      </div>

      {/* Timer + Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <span className="text-xl font-mono font-bold tabular-nums text-primary">
          {formatTime(elapsedSeconds)}
        </span>
        {!isFinished && (
          <div className="flex gap-2">
            {timerRunning ? (
              <Button variant="secondary" size="sm" className="rounded-lg gap-1.5" onClick={pauseTimer}>
                <Pause className="h-3.5 w-3.5" /> Pausa
              </Button>
            ) : (
              <Button size="sm" className="rounded-lg gap-1.5" onClick={startTimer}>
                <Play className="h-3.5 w-3.5" /> Iniciar
              </Button>
            )}
            {isFirstHalf ? (
              <Button variant="secondary" size="sm" className="rounded-lg gap-1.5" onClick={switchHalf}>
                <ArrowRight className="h-3.5 w-3.5" /> Entretiempo
              </Button>
            ) : (
              <Button variant="destructive" size="sm" className="rounded-lg gap-1.5" onClick={finishMatch}>
                <Flag className="h-3.5 w-3.5" /> Finalizar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
