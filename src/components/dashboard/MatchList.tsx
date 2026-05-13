import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Match } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreateMatchDialog } from './CreateMatchDialog'
import { DeleteMatchDialog } from '@/components/match/DeleteMatchDialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronRight, Trash2 } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  first_half: '1er Tiempo',
  half_time: 'Entretiempo',
  second_half: '2do Tiempo',
  finished: 'Finalizado',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  first_half: 'default',
  half_time: 'secondary',
  second_half: 'default',
  finished: 'secondary',
}

export function MatchList() {
  const { user } = useAuthStore()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('matches')
      .select('*, team:teams(*)')
      .eq('user_id', user.id)
      .order('match_date', { ascending: false })
      .then(({ data }) => {
        if (data) setMatches(data as Match[])
        setLoading(false)
      })
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CreateMatchDialog />
      <div className="space-y-2">
        {matches.map(match => {
          const teamName = match.team?.name ?? 'Mi equipo'
          const isLive = ['first_half', 'half_time', 'second_half'].includes(match.status)
          const linkTo = match.status === 'finished'
            ? `/partido/${match.id}/revision`
            : `/partido/${match.id}`
          const matchLabel = match.is_home
            ? `${teamName} vs ${match.opponent_name}`
            : `${match.opponent_name} vs ${teamName}`

          return (
            <div
              key={match.id}
              className="flex items-center gap-2 pr-3 bg-card border border-border rounded-xl hover:bg-accent/50 transition-colors group"
            >
              <Link
                to={linkTo}
                className="flex items-center justify-between flex-1 min-w-0 gap-2 pl-4 py-3.5 cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{matchLabel}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {match.team?.category && `${match.team.category} · `}
                    {format(new Date(match.match_date), "d 'de' MMMM yyyy", { locale: es })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(isLive || match.status === 'finished') && (
                    <span className="text-lg font-bold tabular-nums">
                      {match.home_score} - {match.away_score}
                    </span>
                  )}
                  <Badge variant={STATUS_VARIANT[match.status]} className="text-[10px]">
                    {STATUS_LABELS[match.status]}
                  </Badge>
                </div>
              </Link>
              <DeleteMatchDialog
                matchId={match.id}
                matchLabel={matchLabel}
                onDeleted={() =>
                  setMatches(prev => prev.filter(m => m.id !== match.id))
                }
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    aria-label="Eliminar partido"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                }
              />
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </div>
          )
        })}
        {matches.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No hay partidos aún.</p>
            <p className="text-xs mt-1">Creá uno nuevo para empezar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
