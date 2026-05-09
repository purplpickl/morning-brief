export interface UpcomingGame {
  home: string
  away: string
  gameTime: string   // ISO string
  league: string
  seriesSummary?: string
  playoffNote?: string
  isLive: boolean
}

function todayET(): string {
  return new Date().toLocaleDateString('sv', { timeZone: 'America/New_York' }).replace(/-/g, '')
}

async function fetchLeagueToday(
  sport: string,
  league: string,
  label: string
): Promise<UpcomingGame[]> {
  const date = todayET()
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard?dates=${date}&limit=50`
  const res = await fetch(url, { next: { revalidate: 900 } })
  if (!res.ok) return []
  const data = await res.json()

  const games: UpcomingGame[] = []
  for (const event of data.events ?? []) {
    const comp = event.competitions?.[0]
    if (!comp) continue

    const state: string = comp.status?.type?.state ?? 'pre'
    if (state === 'post') continue   // skip finished games

    const home = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === 'home')
    const away = comp.competitors?.find((c: { homeAway: string }) => c.homeAway === 'away')
    if (!home || !away) continue

    const homeName: string = home.team?.shortDisplayName ?? home.team?.displayName ?? ''
    const awayName: string = away.team?.shortDisplayName ?? away.team?.displayName ?? ''

    const isPlayoff = event.season?.type === 3
    let playoffNote: string | undefined
    if (isPlayoff) {
      const note = comp.notes?.find((n: { headline?: string }) =>
        /game\s+\d+/i.test(n.headline ?? '')
      )
      if (note?.headline) {
        const match = note.headline.match(/game\s+\d+/i)
        playoffNote = match ? match[0].replace(/game\s+/i, 'Game ') : undefined
      }
    }

    games.push({
      home: homeName,
      away: awayName,
      gameTime: comp.startDate ?? event.date ?? '',
      league: label,
      seriesSummary: isPlayoff ? (comp.series?.summary ?? undefined) : undefined,
      playoffNote,
      isLive: state === 'in',
    })
  }

  return games
}

export async function fetchTodayGames(): Promise<UpcomingGame[]> {
  const results = await Promise.allSettled([
    fetchLeagueToday('basketball', 'nba', 'NBA'),
    fetchLeagueToday('hockey', 'nhl', 'NHL'),
    fetchLeagueToday('baseball', 'mlb', 'MLB'),
    fetchLeagueToday('football', 'nfl', 'NFL'),
  ])

  return results
    .flatMap(r => r.status === 'fulfilled' ? r.value : [])
    .sort((a, b) => new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime())
}
