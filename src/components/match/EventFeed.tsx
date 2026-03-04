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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Eventos ({events.length})
        </h3>
        {events.length > 5 && (
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <div className="space-y-1.5">
        {displayEvents.map(event => (
          <div
            key={event.id}
            className="flex items-center justify-between text-sm bg-secondary/60 rounded-xl px-3.5 py-2.5"
          >
            <div className="min-w-0">
              <span className="font-medium">{eventLabel(event)}</span>
              <span className="text-muted-foreground ml-2 text-xs">
                {event.match_minute}' {HALF_LABELS[event.half]}
              </span>
              {event.points > 0 && (
                <span className="text-primary ml-1 text-xs font-medium">+{event.points}</span>
              )}
              {event.player_number && (
                <span className="text-muted-foreground ml-1 text-xs">#{event.player_number}</span>
              )}
              {event.notes && (
                <p className="text-muted-foreground text-xs mt-0.5 truncate">{event.notes}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => deleteEvent(event.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Los eventos aparecerán aquí
          </p>
        )}
      </div>
    </div>
  )
}
