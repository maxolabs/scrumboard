import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMatchStore } from '@/stores/matchStore'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { ScoreCard } from './ScoreCard'
import { ButtonPanel } from './ButtonPanel'
import { EventFeed } from './EventFeed'
import { OfflineBanner } from '@/components/offline/OfflineBanner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'

export function LiveMatchView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { match, loadMatch, cleanup } = useMatchStore()
  useOfflineSync()

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
          <Button className="gap-1.5 rounded-xl">
            <FileText className="h-4 w-4" /> Ver revisión
          </Button>
        </Link>
        <Link to="/">
          <Button variant="ghost">Volver al inicio</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-4 gap-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">Partido en vivo</span>
      </div>

      <OfflineBanner />

      {/* Score + Timer (merged) */}
      <ScoreCard />

      {/* Buttons */}
      <ButtonPanel />

      {/* Events */}
      <EventFeed />
    </div>
  )
}
