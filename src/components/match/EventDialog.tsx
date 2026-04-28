import { useMemo, useState } from 'react'
import type { ButtonConfig, EventTeam, EventOutcome } from '@/lib/types'
import { useMatchStore } from '@/stores/matchStore'
import { TEAM_LABELS, OUTCOME_LABELS, HALF_LABELS } from '@/lib/constants'
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

const SKILL_OPTIONS = [
  { value: 'obs_skills_catch_pass', label: 'Atrapar y pasar' },
  { value: 'obs_skills_duel', label: 'Duelo' },
  { value: 'obs_skills_ruck', label: 'Ruck' },
  { value: 'obs_skills_tackle', label: 'Tackle' },
] as const

const CARD_CATEGORIES = new Set(['yellow_card', 'red_card'])

export function EventDialog({ button, open, onClose }: Props) {
  const { addEvent, match, elapsedSeconds } = useMatchStore()
  const [team, setTeam] = useState<EventTeam>('ours')
  const [outcome, setOutcome] = useState<EventOutcome>('won')
  const [notes, setNotes] = useState('')
  const [playerNumber, setPlayerNumber] = useState('')
  const [skillCategory, setSkillCategory] = useState<string>(SKILL_OPTIONS[0].value)

  const isSetPiece = button?.type === 'set_piece'
  const isObservation = button?.type === 'observation'
  const isCustomNote = button?.type === 'custom_note'
  const isPlayerObs = button?.category === 'obs_player'
  const isSkillsFlow = button?.category === 'obs_skills'
  const isCardEvent = button ? CARD_CATEGORIES.has(button.category) : false
  const minute = Math.floor(elapsedSeconds / 60)

  const resolvedCategory = useMemo(() => {
    if (!button) return ''
    return isSkillsFlow ? skillCategory : button.category
  }, [button, isSkillsFlow, skillCategory])

  if (!button) return null

  const resetForm = () => {
    setNotes('')
    setPlayerNumber('')
    setTeam('ours')
    setOutcome('won')
    setSkillCategory(SKILL_OPTIONS[0].value)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    await addEvent({
      category: resolvedCategory,
      team: isSetPiece || isCardEvent ? team : (button.team ?? null),
      outcome: isSetPiece ? outcome : null,
      notes: notes.trim(),
      playerNumber: (isPlayerObs || isCardEvent) && playerNumber ? parseInt(playerNumber, 10) : null,
    })

    const label = isSkillsFlow
      ? SKILL_OPTIONS.find(option => option.value === skillCategory)?.label ?? button.label
      : button.label
    const halfLabel = match ? HALF_LABELS[match.current_half] : ''
    toast.success(`${label} — Min ${minute}' ${halfLabel}`)

    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{button.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {(isSetPiece || isCardEvent) && (
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

          {isSkillsFlow && (
            <div className="space-y-2">
              <Label>Tipo de destreza</Label>
              <div className="grid grid-cols-2 gap-2">
                {SKILL_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    variant={skillCategory === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSkillCategory(option.value)}
                    className="h-auto min-h-10 whitespace-normal"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {(isPlayerObs || isCardEvent) && (
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

          {(isObservation || isSetPiece || isCustomNote) && (
            <div className="space-y-2">
              <Label>{isSkillsFlow ? 'Comentario' : isCardEvent ? 'Detalle' : 'Notas'}</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={isSkillsFlow ? 'Comentario opcional…' : isCardEvent ? 'Motivo u observación opcional…' : 'Observación...'}
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
