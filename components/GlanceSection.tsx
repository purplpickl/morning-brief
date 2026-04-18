'use client'

import { CalEvent } from '@/lib/gcal'
import { StockQuote } from '@/lib/stocks'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  })
}

export default function GlanceSection({
  calEvents,
  stocks,
}: {
  calEvents: CalEvent[]
  stocks: StockQuote[]
}) {
  const timedEvents = calEvents.filter(e => !e.allDay)
  const firstEvent = timedEvents[0]
  const sp500 = stocks.find(s => s.symbol === 'S&P 500')
  const sp500Up = (sp500?.change ?? 0) >= 0

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6"
      style={{ borderBottom: '1px solid rgba(236,228,211,0.35)' }}
    >
      {/* Left — greeting */}
      <div className="py-6 md:border-r" style={{ borderColor: 'rgba(236,228,211,0.35)' }}>
        <h2
          className="font-editorial font-bold text-ink leading-tight"
          style={{ fontSize: 'clamp(30px, 4vw, 44px)' }}
        >
          {greeting()}, Jacob.
        </h2>
        {timedEvents.length > 0 && (
          <p className="font-body-serif text-base text-muted leading-relaxed mt-2">
            {timedEvents.length} event{timedEvents.length > 1 ? 's' : ''} on the calendar
            {firstEvent ? `, starting at ${fmtTime(firstEvent.start)}` : ''}.
          </p>
        )}
      </div>

      {/* Right — stats */}
      <div className="pb-6 md:py-6 md:pl-6">
        {/* Section head */}
        <div
          className="flex items-center justify-between border-t border-b py-[5px] mb-4"
          style={{ borderColor: 'rgba(236,228,211,0.35)' }}
        >
          <h3 className="font-body-serif text-[20px] font-bold uppercase tracking-[0.08em] text-ink m-0">
            At a Glance
          </h3>
        </div>

        <div>
          {/* Calendar */}
          <div className="flex items-center gap-4 py-2.5" style={{ borderBottom: '1px dotted rgba(236,228,211,0.25)' }}>
            <span className="font-editorial text-3xl font-bold text-ink tabular-nums leading-none" style={{ minWidth: '2rem' }}>
              {timedEvents.length || '—'}
            </span>
            <span className="font-body-serif text-sm text-muted">
              {timedEvents.length > 0
                ? `event${timedEvents.length > 1 ? 's' : ''} · first at ${fmtTime(firstEvent.start)}`
                : 'nothing on the calendar'}
            </span>
          </div>

          {/* S&P 500 */}
          {sp500 && (
            <div className="flex items-center gap-4 py-2.5">
              <span
                className="font-editorial text-2xl font-bold tabular-nums leading-none"
                style={{ color: sp500Up ? '#7fd39e' : '#e07a7a', minWidth: '2rem' }}
              >
                {sp500Up ? '+' : ''}{sp500.changePercent.toFixed(1)}%
              </span>
              <span className="font-body-serif text-sm text-muted">
                S&amp;P 500 · {sp500Up ? 'up' : 'down'} today
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
