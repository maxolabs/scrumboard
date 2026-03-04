import { useState } from 'react'
import { useMatchStore } from '@/stores/matchStore'
import { eventLabel } from '@/lib/utils'
import { HALF_LABELS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'

export function EventFeed() {
  const { events, deleteEvent } = useMatchStore()
  const [expanded, setExpanded] = useState(false)

  const sortedEvents = [...events].reverse()
  const displayEvents = expanded ? sortedEvents : sortedEvents.slice(0, 5)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Eventos ({events.length})</h3>
        {events.length > 5 && (
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <div className="space-y-1">
        {displayEvents.map(event => (
          <div
            key={event.id}
            className="flex items-center justify-between text-sm bg-card border rounded px-3 py-2"
          >
            <div>
              <span className="font-medium">{eventLabel(event)}</span>
              <span className="text-muted-foreground ml-2">
                {event.match_minute}' {HALF_LABELS[event.half]}
              </span>
              {event.points > 0 && (
                <span className="text-muted-foreground ml-1">(+{event.points})</span>
              )}
              {event.player_number && (
                <span className="text-muted-foreground ml-1">#{event.player_number}</span>
              )}
              {event.notes && (
                <span className="text-muted-foreground ml-1">— {event.notes}</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => deleteEvent(event.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-xs text-muted-foreground">Sin eventos aún.</p>
        )}
      </div>
    </div>
  )
}
