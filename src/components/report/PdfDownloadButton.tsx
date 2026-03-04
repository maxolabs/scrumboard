import { pdf } from '@react-pdf/renderer'
import type { Match, MatchEvent } from '@/lib/types'
import { MatchPdfDocument } from './MatchPdfDocument'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Props {
  match: Match
  events: MatchEvent[]
}

export function PdfDownloadButton({ match, events }: Props) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const blob = await pdf(<MatchPdfDocument match={match} events={events} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const teamName = match.team?.name ?? 'Equipo'
      a.download = `${teamName} vs ${match.opponent_name} - ${match.match_date}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Error generando PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={loading} className="gap-1">
      <Download className="h-4 w-4" />
      {loading ? 'Generando...' : 'Descargar PDF'}
    </Button>
  )
}
