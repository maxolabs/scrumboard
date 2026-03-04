import { useMatchStore } from '@/stores/matchStore'
import { formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Play, Pause, ArrowRight, Flag } from 'lucide-react'

export function MatchTimer() {
  const { elapsedSeconds, timerRunning, match, startTimer, pauseTimer, switchHalf, finishMatch } = useMatchStore()
  if (!match) return null

  const isFinished = match.status === 'finished'
  const isFirstHalf = match.current_half === 'first'

  return (
    <div className="flex items-center justify-between bg-card border rounded-lg p-3">
      <div className="text-2xl font-mono font-bold tabular-nums">
        {formatTime(elapsedSeconds)}
      </div>
      <div className="flex gap-2">
        {!isFinished && (
          <>
            {timerRunning ? (
              <Button variant="outline" size="sm" onClick={pauseTimer}>
                <Pause className="h-4 w-4 mr-1" /> Pausa
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={startTimer}>
                <Play className="h-4 w-4 mr-1" /> Iniciar
              </Button>
            )}
            {isFirstHalf ? (
              <Button variant="secondary" size="sm" onClick={switchHalf}>
                <ArrowRight className="h-4 w-4 mr-1" /> ET
              </Button>
            ) : (
              <Button variant="destructive" size="sm" onClick={finishMatch}>
                <Flag className="h-4 w-4 mr-1" /> Fin
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
