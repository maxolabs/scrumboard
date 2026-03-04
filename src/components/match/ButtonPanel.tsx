import { useState } from 'react'
import { useMatchStore } from '@/stores/matchStore'
import type { ButtonConfig } from '@/lib/types'
import { DEFAULT_BUTTONS, CATEGORY_LABELS, HALF_LABELS } from '@/lib/constants'
import { EventDialog } from './EventDialog'
import { toast } from 'sonner'

export function ButtonPanel() {
  const { addEvent, match, elapsedSeconds } = useMatchStore()
  const [dialogButton, setDialogButton] = useState<ButtonConfig | null>(null)

  const buttons = DEFAULT_BUTTONS // TODO: load from user's saved layout

  const handleTap = async (btn: ButtonConfig) => {
    if (btn.type === 'set_piece' || btn.type === 'observation') {
      setDialogButton(btn)
      return
    }

    // Instant event for scoring and penalty types
    await addEvent({
      category: btn.category,
      team: btn.team ?? null,
      points: btn.points,
    })

    const label = CATEGORY_LABELS[btn.category]
    const teamLabel = btn.team === 'ours' ? 'Nuestro' : btn.team === 'theirs' ? 'Rival' : ''
    const minute = Math.floor(elapsedSeconds / 60)
    const halfLabel = match ? HALF_LABELS[match.current_half] : ''
    toast.success(`${label} ${teamLabel} — Min ${minute}' ${halfLabel}`)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {buttons.map(btn => (
          <button
            key={btn.id}
            onClick={() => handleTap(btn)}
            className={`${btn.color} text-white rounded-lg p-3 text-sm font-medium active:scale-95 transition-transform touch-manipulation`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <EventDialog
        button={dialogButton}
        open={!!dialogButton}
        onClose={() => setDialogButton(null)}
      />
    </>
  )
}
