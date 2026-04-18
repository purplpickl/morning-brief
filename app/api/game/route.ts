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

const periodLabel = (leagueKey: string, i: number): string => {
  if (leagueKey === 'MLB') return `${i + 1}`
  if (leagueKey === 'NFL') return ['Q1', 'Q2', 'Q3', 'Q4', 'OT'][i] ?? `OT${i - 3}`
  if (leagueKey === 'NBA') return ['Q1', 'Q2', 'Q3', 'Q4', 'OT'][i] ?? `OT${i - 3}`
  if (leagueKey === 'NHL') return ['P1', 'P2', 'P3', 'OT'][i] ?? `OT${i - 2}`
  return `${i + 1}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractLinescores(homeComp: any, awayComp: any, leagueKey: string): GameDetail['linescores'] {
  // ESPN puts linescores either on the competitor object directly or nested under linescores[]
  const homeLs: { value: number }[] = homeComp?.linescores ?? []
  const awayLs: { value: number }[] = awayComp?.linescores ?? []
  const count = Math.max(homeLs.length, awayLs.length)
  if (count === 0) return []

  const result: GameDetail['linescores'] = []
  for (let i = 0; i < count; i++) {
    result.push({
      label: periodLabel(leagueKey, i),
      home: homeLs[i]?.value ?? '-',
      away: awayLs[i]?.value ?? '-',
    })
  }
  return result
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

  // Competitors live under header.competitions[0]
  const comp = data.header?.competitions?.[0]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const competitors: any[] = comp?.competitors ?? []
  const homeComp = competitors.find(c => c.homeAway === 'home')
  const awayComp = competitors.find(c => c.homeAway === 'away')

  const homeName: string = homeComp?.team?.shortDisplayName ?? homeComp?.team?.displayName ?? ''
  const awayName: string = awayComp?.team?.shortDisplayName ?? awayComp?.team?.displayName ?? ''
  const homeScore: number = parseInt(homeComp?.score ?? '0')
  const awayScore: number = parseInt(awayComp?.score ?? '0')

  // Records: check both record[] and statistics[] paths ESPN uses
  const homeRecord: string | undefined =
    homeComp?.record?.[0]?.summary ??
    homeComp?.records?.[0]?.summary
  const awayRecord: string | undefined =
    awayComp?.record?.[0]?.summary ??
    awayComp?.records?.[0]?.summary

  // Series summary: check multiple ESPN paths
  const seriesSummary: string | undefined =
    comp?.series?.summary ??
    comp?.playoff?.seriesSummary ??
    data.header?.season?.type?.name === 'Postseason' ? comp?.notes?.[0]?.headline : undefined

  const linescores = extractLinescores(homeComp, awayComp, leagueKey)

  // Leaders: top performers from data.leaders[]
  const leaders: GameDetail['leaders'] = []
  for (const leaderGroup of data.leaders ?? []) {
    for (const leader of leaderGroup.leaders ?? []) {
      const athlete = leader.athlete
      if (!athlete) continue
      const teamId = athlete.team?.id ?? leader.team?.id
      const homeTeamId = homeComp?.team?.id
      leaders.push({
        team: teamId === homeTeamId ? 'home' : 'away',
        name: athlete.displayName ?? '',
        shortName: athlete.shortName ?? athlete.displayName ?? '',
        stat: leader.displayValue ?? '',
      })
      if (leaders.length >= 6) break
    }
    if (leaders.length >= 6) break
  }

  return NextResponse.json({
    homeName,
    awayName,
    homeScore,
    awayScore,
    homeRecord,
    awayRecord,
    seriesSummary,
    linescores,
    leaders,
  } satisfies GameDetail)
}
