import type { MatchEvent } from '@/lib/types'
import { getSetPieceStats, getObservationNotes, countEvents } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  events: MatchEvent[]
}

export function StatsGrid({ events }: Props) {
  const scrumStats = getSetPieceStats(events, 'scrum')
  const lineStats = getSetPieceStats(events, 'lineout')

  const attackNotes = getObservationNotes(events, 'obs_attack')
  const defenseNotes = getObservationNotes(events, 'obs_defense')
  const catchPassNotes = getObservationNotes(events, 'obs_skills_catch_pass')
  const duelNotes = getObservationNotes(events, 'obs_skills_duel')
  const tackleNotes = getObservationNotes(events, 'obs_skills_tackle')
  const ruckNotes = getObservationNotes(events, 'obs_skills_ruck')
  const generalNotes = getObservationNotes(events, 'obs_general')
  const playerObs = events.filter(e => e.category === 'obs_player')

  const penFor = countEvents(events, 'penalty_for')
  const penAgainst = countEvents(events, 'penalty_against')

  return (
    <div className="space-y-4">
      {/* Attack / Defense */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ObsCard title="Ataque" items={attackNotes} />
        <ObsCard title="Defensa" items={defenseNotes} />
      </div>

      {/* Set pieces */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SetPieceCard title="Scrum" stats={scrumStats} />
        <SetPieceCard title="Line" stats={lineStats} />
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ObsCard title="Atrapar y Pasar" items={catchPassNotes} />
        <ObsCard title="Duelo" items={duelNotes} />
        <ObsCard title="Tackle" items={tackleNotes} />
        <ObsCard title="Ruck" items={ruckNotes} />
      </div>

      {/* General observations */}
      {(generalNotes.length > 0 || playerObs.length > 0) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Observaciones</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {generalNotes.map((n, i) => <p key={i}>- {n}</p>)}
            {playerObs.map((e, i) => (
              <p key={i}>- #{e.player_number}: {e.notes}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Penalties */}
      <Card>
        <CardHeader><CardTitle className="text-base">Penales</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <p>A favor: {penFor}</p>
          <p>En contra: {penAgainst}</p>
        </CardContent>
      </Card>
    </div>
  )
}

function ObsCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="text-sm space-y-1">
        {items.length > 0
          ? items.map((n, i) => <p key={i}>- {n}</p>)
          : <p className="text-muted-foreground">—</p>
        }
      </CardContent>
    </Card>
  )
}

function SetPieceCard({ title, stats }: {
  title: string
  stats: ReturnType<typeof getSetPieceStats>
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="text-sm space-y-1">
        <p>Tirados: {stats.thrown}</p>
        <p>Perdidos: {stats.lost}</p>
        <p>Robados: {stats.stolen}/{stats.stolenTotal}</p>
        <p>Penales F: {stats.penaltyFor} / C: {stats.penaltyAgainst}</p>
      </CardContent>
    </Card>
  )
}
