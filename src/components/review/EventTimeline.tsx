import type { Match, MatchEvent } from '@/lib/types'
import { eventLabel } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  events: MatchEvent[]
  match: Match
}

export function EventTimeline({ events, match }: Props) {
  const teamName = match.team?.name ?? 'Mi equipo'
  const abbreviation = teamName.slice(0, 3).toUpperCase()
  const oppAbbr = match.opponent_name.slice(0, 3).toUpperCase()

  const scoringEvents = events.filter(e => e.points > 0)
  const firstHalf = scoringEvents.filter(e => e.half === 'first')
  const secondHalf = scoringEvents.filter(e => e.half === 'second')

  const renderEvent = (e: MatchEvent) => {
    const teamAbbr = e.team === 'ours' ? abbreviation : oppAbbr
    return (
      <p key={e.id} className="text-sm">
        {e.match_minute}' {eventLabel(e)} {teamAbbr}
        {e.notes && ` (${e.notes})`}
      </p>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Resultado</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="font-semibold">PT</p>
          {firstHalf.length > 0
            ? firstHalf.map(renderEvent)
            : <p className="text-muted-foreground">Sin anotaciones</p>
          }
        </div>
        <div>
          <p className="font-semibold">ST</p>
          {secondHalf.length > 0
            ? secondHalf.map(renderEvent)
            : <p className="text-muted-foreground">Sin anotaciones</p>
          }
        </div>
      </CardContent>
    </Card>
  )
}
