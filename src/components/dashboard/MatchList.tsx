import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Match } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateMatchDialog } from './CreateMatchDialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
    return <div className="text-muted-foreground">Cargando partidos...</div>
  }

  return (
    <div className="space-y-4">
      <CreateMatchDialog />
      <div className="grid gap-3">
        {matches.map(match => {
          const teamName = match.team?.name ?? 'Mi equipo'
          const isLive = ['first_half', 'half_time', 'second_half'].includes(match.status)
          const linkTo = match.status === 'finished'
            ? `/partido/${match.id}/revision`
            : `/partido/${match.id}`

          return (
            <Link key={match.id} to={linkTo}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {match.is_home
                        ? `${teamName} vs ${match.opponent_name}`
                        : `${match.opponent_name} vs ${teamName}`
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {match.team?.category && `${match.team.category} · `}
                      {format(new Date(match.match_date), "d 'de' MMMM yyyy", { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {(isLive || match.status === 'finished') && (
                      <span className="text-lg font-bold tabular-nums">
                        {match.home_score} - {match.away_score}
                      </span>
                    )}
                    <Badge variant={STATUS_VARIANT[match.status]}>
                      {STATUS_LABELS[match.status]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
        {matches.length === 0 && (
          <p className="text-muted-foreground text-sm">No hay partidos aún. Creá uno nuevo.</p>
        )}
      </div>
    </div>
  )
}
