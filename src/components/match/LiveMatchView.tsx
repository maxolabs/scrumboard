import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMatchStore } from '@/stores/matchStore'
import { ScoreCard } from './ScoreCard'
import { MatchTimer } from './MatchTimer'
import { ButtonPanel } from './ButtonPanel'
import { EventFeed } from './EventFeed'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'

export function LiveMatchView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { match, loadMatch, cleanup } = useMatchStore()

  useEffect(() => {
    if (id) loadMatch(id)
    return () => cleanup()
  }, [id, loadMatch, cleanup])

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (match.status === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <p className="text-lg font-medium">Partido finalizado</p>
        <Link to={`/partido/${match.id}/revision`}>
          <Button className="gap-1">
            <FileText className="h-4 w-4" /> Ver revisión
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline">Volver al inicio</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-3 gap-3 max-w-lg mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-muted-foreground">Partido en vivo</span>
      </div>
      <ScoreCard />
      <MatchTimer />
      <ButtonPanel />
      <EventFeed />
    </div>
  )
}
