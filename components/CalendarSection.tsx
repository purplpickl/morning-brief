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

function getETDateStr(event: CalEvent): string {
  if (event.allDay) return event.start.slice(0, 10)
  return new Date(event.start).toLocaleDateString('sv', { timeZone: 'America/New_York' })
}

function EventRow({ event, now }: { event: CalEvent; now: Date }) {
  const isPast = !event.allDay && new Date(event.end) < now
  return (
    <div
      key={event.id}
      className="grid gap-3 py-2 row-divider"
      style={{ gridTemplateColumns: '68px 1fr', opacity: isPast ? 0.42 : 1 }}
    >
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
}

export default function CalendarSection({ events }: { events: CalEvent[] }) {
  const now = new Date()
  const todayStr = now.toLocaleDateString('sv', { timeZone: 'America/New_York' })
  const tomorrowDate = new Date(now)
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = tomorrowDate.toLocaleDateString('sv', { timeZone: 'America/New_York' })

  const todayEvents = events.filter(e => getETDateStr(e) === todayStr)
  const tomorrowEvents = events.filter(e => getETDateStr(e) === tomorrowStr)

  if (events.length === 0) {
    return (
      <p className="font-label text-xs text-muted italic">
        No events — calendar not yet configured.
      </p>
    )
  }

  return (
    <div>
      {todayEvents.length > 0 && (
        <>
          <p className="sub-head">Today</p>
          {todayEvents.map(e => <EventRow key={e.id} event={e} now={now} />)}
        </>
      )}
      {tomorrowEvents.length > 0 && (
        <div className={todayEvents.length > 0 ? 'mt-4' : ''}>
          <p className="sub-head">Tomorrow</p>
          {tomorrowEvents.map(e => <EventRow key={e.id} event={e} now={now} />)}
        </div>
      )}
    </div>
  )
}
