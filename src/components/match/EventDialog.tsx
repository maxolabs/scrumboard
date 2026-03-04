import { useState } from 'react'
import type { ButtonConfig, EventTeam, EventOutcome } from '@/lib/types'
import { useMatchStore } from '@/stores/matchStore'
import { TEAM_LABELS, OUTCOME_LABELS, CATEGORY_LABELS, HALF_LABELS } from '@/lib/constants'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Props {
  button: ButtonConfig | null
  open: boolean
  onClose: () => void
}

export function EventDialog({ button, open, onClose }: Props) {
  const { addEvent, match, elapsedSeconds } = useMatchStore()
  const [team, setTeam] = useState<EventTeam>('ours')
  const [outcome, setOutcome] = useState<EventOutcome>('won')
  const [notes, setNotes] = useState('')
  const [playerNumber, setPlayerNumber] = useState('')

  if (!button) return null

  const isSetPiece = button.type === 'set_piece'
  const isObservation = button.type === 'observation'
  const isPlayerObs = button.category === 'obs_player'
  const minute = Math.floor(elapsedSeconds / 60)

  const handleSubmit = async () => {
    await addEvent({
      category: button.category,
      team: isSetPiece ? team : (button.team ?? null),
      outcome: isSetPiece ? outcome : null,
      notes: notes.trim(),
      playerNumber: isPlayerObs && playerNumber ? parseInt(playerNumber, 10) : null,
    })

    const label = CATEGORY_LABELS[button.category]
    const halfLabel = match ? HALF_LABELS[match.current_half] : ''
    toast.success(`${label} — Min ${minute}' ${halfLabel}`)

    setNotes('')
    setPlayerNumber('')
    setTeam('ours')
    setOutcome('won')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{CATEGORY_LABELS[button.category]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isSetPiece && (
            <>
              <div className="space-y-2">
                <Label>Equipo</Label>
                <div className="flex gap-2">
                  {(['ours', 'theirs'] as EventTeam[]).map(t => (
                    <Button
                      key={t}
                      variant={team === t ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTeam(t)}
                      className="flex-1"
                    >
                      {TEAM_LABELS[t]}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Resultado</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['won', 'lost', 'penalty_for', 'penalty_against'] as EventOutcome[]).map(o => (
                    <Button
                      key={o}
                      variant={outcome === o ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOutcome(o)}
                    >
                      {OUTCOME_LABELS[o]}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {isPlayerObs && (
            <div className="space-y-2">
              <Label>N° de camiseta</Label>
              <Input
                type="number"
                value={playerNumber}
                onChange={e => setPlayerNumber(e.target.value)}
                placeholder="Ej: 10"
              />
            </div>
          )}

          {(isObservation || isSetPiece) && (
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observación..."
                rows={3}
              />
            </div>
          )}

          <Button className="w-full" onClick={handleSubmit}>
            Registrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
