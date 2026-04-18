'use client'

import { useEffect, useState } from 'react'
import { CalEvent } from '@/lib/gcal'
import { GameScore } from '@/lib/scores'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function fmtTime(iso: string, tz: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: tz,
  })
}

function pickBigGame(scores: GameScore[]): GameScore | null {
  if (scores.length === 0) return null
  const highlighted = scores.find(g => g.highlight)
  if (highlighted) return highlighted
  const priority = ['NBA', 'NHL', 'MLB', 'NFL', 'NCAAM']
  for (const league of priority) {
    const g = scores.find(s => s.league === league)
    if (g) return g
  }
  return scores[0]
}

function gameBlurb(game: GameScore): string {
  const homeWon = game.homeScore > game.awayScore
  const winner = homeWon ? game.home : game.away
  const loser  = homeWon ? game.away : game.home
  const ws = homeWon ? game.homeScore : game.awayScore
  const ls = homeWon ? game.awayScore : game.homeScore
  return `${winner} over ${loser}, ${ws}–${ls}`
}

export default function GreetingSection({
  calEvents,
  scores,
}: {
  calEvents: CalEvent[]
  scores: GameScore[]
}) {
  const [sunrise, setSunrise] = useState<string | null>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const { latitude, longitude } = pos.coords
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise&timezone=auto&forecast_days=1`
        const res = await fetch(url)
        const data = await res.json()
        const raw: string = data.daily?.sunrise?.[0] ?? ''
        if (raw) {
          // raw is like "2026-04-18T06:54" — parse as local time in the timezone open-meteo returned
          const tz: string = data.timezone ?? 'America/New_York'
          setSunrise(fmtTime(raw, tz))
        }
      } catch { /* skip */ }
    })
  }, [])

  const timedEvents = calEvents.filter(e => !e.allDay)
  const bigGame = pickBigGame(scores)

  const parts: string[] = []
  if (timedEvents.length > 0) {
    parts.push(`${timedEvents.length} event${timedEvents.length > 1 ? 's' : ''} on the calendar`)
  } else {
    parts.push('Nothing on the calendar today')
  }
  if (sunrise) parts.push(`sunrise at ${sunrise}`)
  if (bigGame) parts.push(gameBlurb(bigGame))

  return (
    <div className="py-6" style={{ borderBottom: '1px solid rgba(236,228,211,0.35)' }}>
      <h2
        className="font-editorial font-bold text-ink leading-tight mb-2"
        style={{ fontSize: 'clamp(30px, 4vw, 44px)' }}
      >
        {greeting()}, Jacob.
      </h2>
      <p className="font-body-serif text-base text-muted leading-relaxed">
        {parts.join(' · ')}.
      </p>
    </div>
  )
}
