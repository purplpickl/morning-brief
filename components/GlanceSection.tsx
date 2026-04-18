'use client'

import { useEffect, useState } from 'react'
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
  const [highTemp, setHighTemp] = useState<number | null>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const { latitude, longitude } = pos.coords
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`
        const res = await fetch(url)
        const data = await res.json()
        setHighTemp(Math.round(data.daily?.temperature_2m_max?.[0] ?? null))
      } catch { /* skip */ }
    })
  }, [])

  const timedEvents = calEvents.filter(e => !e.allDay)
  const firstEvent = timedEvents[0]
  const sp500 = stocks.find(s => s.symbol === 'S&P 500')

  const summaryParts: string[] = []
  if (highTemp !== null) summaryParts.push(`Today's high is ${highTemp}°`)
  if (timedEvents.length > 0) {
    summaryParts.push(
      `${timedEvents.length} event${timedEvents.length > 1 ? 's' : ''} on the calendar`
    )
  } else if (calEvents.length === 0) {
    summaryParts.push('Nothing on the calendar today')
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6"
      style={{ borderBottom: '1px solid rgba(236,228,211,0.35)' }}
    >
      {/* Left — greeting */}
      <div>
        <h2
          className="font-editorial font-bold text-ink leading-tight mb-3"
          style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
        >
          {greeting()}, Jacob.
        </h2>
        {summaryParts.length > 0 && (
          <p className="font-body-serif text-base text-muted leading-relaxed">
            {summaryParts.join('. ')}.
          </p>
        )}
      </div>

      {/* Right — at a glance */}
      <div
        className="md:border-l md:pl-6"
        style={{ borderColor: 'rgba(236,228,211,0.35)' }}
      >
        <p className="col-label mb-3">Today, at a glance</p>
        <div className="space-y-0">

          {/* Calendar */}
          <div className="flex items-baseline gap-3 py-2.5" style={{ borderBottom: '1px dotted rgba(236,228,211,0.25)' }}>
            <span className="font-editorial text-2xl font-bold text-ink w-7 shrink-0 tabular-nums">
              {calEvents.filter(e => !e.allDay).length || '—'}
            </span>
            <span className="font-body-serif text-sm text-muted">
              {timedEvents.length > 0
                ? `event${timedEvents.length > 1 ? 's' : ''} · first at ${fmtTime(firstEvent.start)}`
                : 'no events today'}
            </span>
          </div>

          {/* Markets */}
          {sp500 && (
            <div className="flex items-baseline gap-3 py-2.5" style={{ borderBottom: '1px dotted rgba(236,228,211,0.25)' }}>
              <span
                className="font-editorial text-2xl font-bold w-7 shrink-0 tabular-nums"
                style={{ color: sp500.change >= 0 ? '#7fd39e' : '#e07a7a', fontSize: '18px' }}
              >
                {sp500.change >= 0 ? '+' : ''}{sp500.changePercent.toFixed(1)}%
              </span>
              <span className="font-body-serif text-sm text-muted">
                S&amp;P 500 · {sp500.change >= 0 ? 'up' : 'down'} today
              </span>
            </div>
          )}

          {/* Weather high */}
          {highTemp !== null && (
            <div className="flex items-baseline gap-3 py-2.5">
              <span className="font-editorial text-2xl font-bold text-ink w-7 shrink-0 tabular-nums" style={{ fontSize: '18px' }}>
                {highTemp}°
              </span>
              <span className="font-body-serif text-sm text-muted">high today</span>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
