import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Match, MatchEvent } from '@/lib/types'
import { StatsGrid } from './StatsGrid'
import { EventTimeline } from './EventTimeline'
import { PdfDownloadButton } from '@/components/report/PdfDownloadButton'
import { DeleteMatchDialog } from '@/components/match/DeleteMatchDialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function MatchReviewView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [match, setMatch] = useState<Match | null>(null)
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('matches').select('*, team:teams(*)').eq('id', id).single(),
      supabase.from('match_events').select('*').eq('match_id', id).order('created_at'),
    ]).then(([matchRes, eventsRes]) => {
      if (matchRes.data) {
        setMatch(matchRes.data as Match)
        setNotes(matchRes.data.notes ?? '')
      }
      if (eventsRes.data) setEvents(eventsRes.data as MatchEvent[])
      setLoading(false)
    })
  }, [id])

  const [savingNotes, setSavingNotes] = useState(false)

  const saveNotes = async () => {
    if (!match || savingNotes) return
    setSavingNotes(true)
    try {
      const { error } = await supabase
        .from('matches')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', match.id)
      if (error) throw error
      toast.success('Notas guardadas')
    } catch {
      toast.error('No se pudieron guardar las notas. Reintenta.')
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading || !match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const teamName = match.team?.name ?? 'Mi equipo'

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-xl font-bold">Revisión del partido</h1>
        </div>
        <div className="flex items-center gap-2">
          <DeleteMatchDialog
            matchId={match.id}
            matchLabel={`${teamName} vs ${match.opponent_name}`}
            onDeleted={() => navigate('/')}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Eliminar partido">
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            }
          />
          <PdfDownloadButton match={match} events={events} />
        </div>
      </div>

      <div className="bg-primary text-primary-foreground rounded-lg p-4 text-center">
        <p className="text-sm opacity-80">{match.team?.category}</p>
        <p className="text-2xl font-bold">
          {match.is_home ? teamName : match.opponent_name}{' '}
          {match.home_score} - {match.away_score}{' '}
          {match.is_home ? match.opponent_name : teamName}
        </p>
      </div>

      <StatsGrid events={events} />
      <EventTimeline events={events} match={match} />

      <div className="space-y-2">
        <h2 className="font-semibold">Propuesta / Notas</h2>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          placeholder="Propuesta para el próximo partido..."
        />
        <Button onClick={saveNotes} size="sm" disabled={savingNotes}>
          {savingNotes ? 'Guardando…' : 'Guardar notas'}
        </Button>
      </div>
    </div>
  )
}
