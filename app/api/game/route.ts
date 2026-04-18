import { NextRequest, NextResponse } from 'next/server'

const ESPN_SLUGS: Record<string, { sport: string; league: string }> = {
  NBA:   { sport: 'basketball', league: 'nba' },
  NHL:   { sport: 'hockey',     league: 'nhl' },
  MLB:   { sport: 'baseball',   league: 'mlb' },
  NFL:   { sport: 'football',   league: 'nfl' },
  NCAAM: { sport: 'basketball', league: 'mens-college-basketball' },
  NCAAW: { sport: 'basketball', league: 'womens-college-basketball' },
}

export interface GameDetail {
  homeName: string
  awayName: string
  homeScore: number
  awayScore: number
  homeRecord?: string
  awayRecord?: string
  seriesSummary?: string
  linescores: { label: string; home: number | string; away: number | string }[]
  leaders: { team: 'home' | 'away'; name: string; stat: string; shortName: string }[]
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const gameId = searchParams.get('id')
  const leagueKey = searchParams.get('league')

  if (!gameId || !leagueKey) {
    return NextResponse.json({ error: 'Missing id or league' }, { status: 400 })
  }

  const slugs = ESPN_SLUGS[leagueKey]
  if (!slugs) {
    return NextResponse.json({ error: 'Unknown league' }, { status: 400 })
  }

  const url = `https://site.api.espn.com/apis/site/v2/sports/${slugs.sport}/${slugs.league}/summary?event=${gameId}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return NextResponse.json({ error: 'ESPN fetch failed' }, { status: 502 })

  const data = await res.json()

  const comp = data.header?.competitions?.[0]
  const homeComp = comp?.competitors?.find((c: { homeAway: string }) => c.homeAway === 'home')
  const awayComp = comp?.competitors?.find((c: { homeAway: string }) => c.homeAway === 'away')

  const homeName: string = homeComp?.team?.shortDisplayName ?? homeComp?.team?.displayName ?? ''
  const awayName: string = awayComp?.team?.shortDisplayName ?? awayComp?.team?.displayName ?? ''
  const homeScore: number = parseInt(homeComp?.score ?? '0')
  const awayScore: number = parseInt(awayComp?.score ?? '0')
  const homeRecord: string | undefined = homeComp?.record?.[0]?.summary
  const awayRecord: string | undefined = awayComp?.record?.[0]?.summary
  const seriesSummary: string | undefined = comp?.series?.summary ?? comp?.playoff?.seriesSummary

  // Line scores (quarters/periods/innings)
  const linescores: GameDetail['linescores'] = []
  const homeLinescore: { value: number }[] = homeComp?.linescores ?? []
  const awayLinescore: { value: number }[] = awayComp?.linescores ?? []
  const count = Math.max(homeLinescore.length, awayLinescore.length)

  const periodLabel = (leagueKey: string, i: number) => {
    if (leagueKey === 'MLB') return `${i + 1}`
    if (leagueKey === 'NFL') return ['Q1','Q2','Q3','Q4','OT'][i] ?? `OT${i - 3}`
    if (leagueKey === 'NBA') return ['Q1','Q2','Q3','Q4','OT'][i] ?? `OT${i - 3}`
    if (leagueKey === 'NHL') return ['P1','P2','P3','OT'][i] ?? `OT${i - 2}`
    return `${i + 1}`
  }

  for (let i = 0; i < count; i++) {
    linescores.push({
      label: periodLabel(leagueKey, i),
      home: homeLinescore[i]?.value ?? '-',
      away: awayLinescore[i]?.value ?? '-',
    })
  }

  // Leaders
  const leaders: GameDetail['leaders'] = []
  for (const leaderGroup of data.leaders ?? []) {
    for (const leader of leaderGroup.leaders ?? []) {
      const athlete = leader.athlete
      if (!athlete) continue
      const teamId = athlete.team?.id
      const homeTeamId = homeComp?.team?.id
      leaders.push({
        team: teamId === homeTeamId ? 'home' : 'away',
        name: athlete.displayName ?? '',
        shortName: athlete.shortName ?? athlete.displayName ?? '',
        stat: leader.displayValue ?? '',
      })
      if (leaders.length >= 4) break
    }
    if (leaders.length >= 4) break
  }

  const detail: GameDetail = {
    homeName,
    awayName,
    homeScore,
    awayScore,
    homeRecord,
    awayRecord,
    seriesSummary,
    linescores,
    leaders,
  }

  return NextResponse.json(detail)
}
