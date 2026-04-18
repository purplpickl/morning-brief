import { CalEvent } from '@/lib/gcal'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  })
}

function getDuration(start: string, end: string): string {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

export default function CalendarSection({ events }: { events: CalEvent[] }) {
  const now = new Date()

  if (events.length === 0) {
    return (
      <p className="font-label text-xs text-muted italic">
        No events today — calendar not yet configured.
      </p>
    )
  }

  return (
    <div>
      {events.map(event => {
        const isPast = !event.allDay && new Date(event.end) < now
        return (
          <div
            key={event.id}
            className="grid gap-3 py-2 row-divider"
            style={{ gridTemplateColumns: '68px 1fr', opacity: isPast ? 0.42 : 1 }}
          >
            {/* Time column */}
            <div>
              <div className="font-label text-[11px] font-semibold text-muted">
                {event.allDay ? 'All day' : formatTime(event.start)}
              </div>
              {!event.allDay && (
                <div className="font-label text-[10px] text-muted/60">
                  {getDuration(event.start, event.end)}
                </div>
              )}
            </div>

            {/* Event column */}
            <div>
              <div className="flex items-start gap-2">
                <span
                  className="mt-[5px] shrink-0 w-2 h-2 rounded-sm"
                  style={{ background: event.color }}
                />
                <span className="text-[13px] font-medium text-ink leading-snug">
                  {event.title}
                </span>
              </div>
              {event.location && (
                <div className="font-label text-[10px] text-muted mt-0.5 ml-4 truncate">
                  {event.location}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
