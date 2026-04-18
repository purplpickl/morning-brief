export interface GameScore {
  home: string
  away: string
  homeScore: number
  awayScore: number
  status: string
  league: string
  highlight?: string
  gameId: string
  playoffNote?: string  // e.g. "Game 5", "Game 2" — only present during playoffs
}

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

async function fetchLeague(sport: string, league: string, label: string): Promise<GameScore[]> {
  const date = yesterday()
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${date}&limit=50`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  const data = await res.json()

  const games: GameScore[] = []
  for (const event of data.events ?? []) {
    const comp = event.competitions?.[0]
    if (!comp) continue
    const competitors = comp.competitors ?? []
    const home = competitors.find((c: { homeAway: string }) => c.homeAway === 'home')
    const away = competitors.find((c: { homeAway: string }) => c.homeAway === 'away')
    if (!home || !away) continue

    const homeName = home.team?.shortDisplayName ?? home.team?.displayName ?? ''
    const awayName = away.team?.shortDisplayName ?? away.team?.displayName ?? ''

    // Flag SC and Mets games
    const scTeams = ['South Carolina', 'Gamecocks']
    const metsTeams = ['Mets', 'New York Mets']
    const allNames = [homeName, awayName, home.team?.displayName, away.team?.displayName]
    const isSC = scTeams.some(t => allNames.some(n => n?.includes(t)))
    const isMets = metsTeams.some(t => allNames.some(n => n?.includes(t)))

    // Playoff game number — ESPN puts it in competition notes during postseason
    const isPlayoff = event.season?.type?.id === '3' || event.season?.type?.type === 3
    let playoffNote: string | undefined
    if (isPlayoff) {
      const note = comp.notes?.find((n: { headline?: string }) =>
        /game\s+\d+/i.test(n.headline ?? '')
      )
      if (note?.headline) {
        const match = note.headline.match(/game\s+\d+/i)
        playoffNote = match ? match[0].replace(/game\s+/i, 'Game ') : undefined
      }
      // Fallback: check series summary for game count
      if (!playoffNote && comp.series?.summary) {
        const m = comp.series.summary.match(/game\s+\d+/i)
        if (m) playoffNote = m[0].replace(/game\s+/i, 'Game ')
      }
    }

    games.push({
      home: homeName,
      away: awayName,
      homeScore: parseInt(home.score ?? '0'),
      awayScore: parseInt(away.score ?? '0'),
      status: comp.status?.type?.shortDetail ?? '',
      league: label,
      highlight: isSC ? 'SC' : isMets ? 'Mets' : undefined,
      gameId: event.id ?? '',
      playoffNote,
    })
  }
  return games
}

export async function fetchYesterdayScores(): Promise<GameScore[]> {
  const results = await Promise.allSettled([
    fetchLeague('basketball', 'nba', 'NBA'),
    fetchLeague('hockey', 'nhl', 'NHL'),
    fetchLeague('baseball', 'mlb', 'MLB'),
    fetchLeague('football', 'nfl', 'NFL'),
    fetchLeague('basketball', 'mens-college-basketball', 'NCAAM'),
    fetchLeague('basketball', 'womens-college-basketball', 'NCAAW'),
  ])

  return results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
}
