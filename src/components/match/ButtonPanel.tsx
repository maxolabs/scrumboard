import { useEffect, useState } from 'react'
import { useMatchStore } from '@/stores/matchStore'
import { useButtonLayoutStore } from '@/stores/buttonLayoutStore'
import type { ButtonConfig, EventTeam } from '@/lib/types'
import { HALF_LABELS, TEAM_LABELS } from '@/lib/constants'
import { EventDialog } from './EventDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function ButtonPanel() {
  const { addEvent, match, elapsedSeconds } = useMatchStore()
  const { buttons: allButtons, load } = useButtonLayoutStore()
  const [dialogButton, setDialogButton] = useState<ButtonConfig | null>(null)
  const [teamPickButton, setTeamPickButton] = useState<ButtonConfig | null>(null)

  useEffect(() => { load() }, [load])

  const buttons = allButtons.filter(btn => btn.visible !== false)
  const isMatchActive = match && ['first_half', 'second_half'].includes(match.status)

  const handleTap = (btn: ButtonConfig) => {
    if (!isMatchActive) return

    // Set piece, observation, or custom with notes → open full dialog
    if (btn.type === 'set_piece' || btn.type === 'observation' || btn.type === 'custom_note') {
      setDialogButton(btn)
      return
    }

    // Scoring or custom with team pick → open team selection popup
    if (btn.type === 'scoring' || btn.type === 'custom_team') {
      setTeamPickButton(btn)
      return
    }

    // Penalty (pre-set team) → instant event
    handleInstantEvent(btn, btn.team ?? null)
  }

  const handleTeamSelect = async (team: EventTeam) => {
    if (!teamPickButton) return
    await handleInstantEvent(teamPickButton, team)
    setTeamPickButton(null)
  }

  const handleInstantEvent = async (btn: ButtonConfig, team: EventTeam | null) => {
    await addEvent({
      category: btn.category,
      team,
      points: btn.points,
    })

    const label = btn.label
    const teamLabel = team ? ` ${TEAM_LABELS[team]}` : ''
    const minute = Math.floor(elapsedSeconds / 60)
    const halfLabel = match ? HALF_LABELS[match.current_half] : ''
    toast.success(`${label}${teamLabel} — Min ${minute}' ${halfLabel}`)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        {buttons.map(btn => (
          <button
            key={btn.id}
            onClick={() => handleTap(btn)}
            disabled={!isMatchActive}
            className={`
              relative rounded-xl p-4 text-sm font-semibold
              transition-all duration-150 touch-manipulation
              ${isMatchActive
                ? 'bg-secondary hover:bg-accent active:scale-[0.97] text-foreground'
                : 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Team selection popup for scoring buttons */}
      <Dialog open={!!teamPickButton} onOpenChange={v => !v && setTeamPickButton(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center">
              {teamPickButton ? teamPickButton.label : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-3">
            <Button
              className="flex-1 h-14 text-base font-semibold rounded-xl"
              onClick={() => handleTeamSelect('ours')}
            >
              Nuestro
            </Button>
            <Button
              variant="secondary"
              className="flex-1 h-14 text-base font-semibold rounded-xl"
              onClick={() => handleTeamSelect('theirs')}
            >
              Rival
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full dialog for set pieces and observations */}
      <EventDialog
        button={dialogButton}
        open={!!dialogButton}
        onClose={() => setDialogButton(null)}
      />
    </>
  )
}
