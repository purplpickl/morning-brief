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
  notes: string[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractSeriesSummary(comp: any, comp2: any, data: any): string | undefined {
  const isPostseason =
    data.header?.season?.type?.id === '3' ||
    data.header?.season?.type?.type === 3 ||
    data.season?.type === 3

  return (
    comp?.series?.summary ??
    comp2?.series?.summary ??
    comp?.seriesSummary ??
    (isPostseason ? (comp?.notes?.[0]?.headline ?? comp2?.notes?.[0]?.headline) : undefined)
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildNotes(data: any, homeComp: any, awayComp: any, homeScore: number, awayScore: number): string[] {
  const playerStats = new Map<string, { teamAbbr: string; stats: string[] }>()

  for (const group of (data.leaders ?? [])) {
    const top = group.leaders?.[0]
    if (!top) continue
    const shortName: string = top.athlete?.shortName ?? top.athlete?.displayName ?? ''
    if (!shortName || !top.displayValue) continue

    const teamId: string = top.athlete?.team?.id ?? top.team?.id ?? ''
    const homeId: string = homeComp?.team?.id ?? ''
    const isHome = teamId && homeId ? teamId === homeId : false
    const abbr: string = isHome
      ? (homeComp?.team?.abbreviation ?? homeComp?.team?.shortDisplayName ?? '')
      : (awayComp?.team?.abbreviation ?? awayComp?.team?.shortDisplayName ?? '')

    if (!playerStats.has(shortName)) {
      playerStats.set(shortName, { teamAbbr: abbr, stats: [] })
    }
    playerStats.get(shortName)!.stats.push(top.displayValue as string)
  }

  const notes: string[] = []
  let playerCount = 0
  for (const [name, { teamAbbr, stats }] of playerStats) {
    if (playerCount >= 2) break
    const label = teamAbbr ? `${name} (${teamAbbr})` : name
    notes.push(`${label}: ${stats.join(', ')}`)
    playerCount++
  }

  // Game context note
  const diff = Math.abs(homeScore - awayScore)
  const winnerComp = homeScore > awayScore ? homeComp : awayComp
  const winner: string = winnerComp?.team?.shortDisplayName ?? winnerComp?.team?.displayName ?? ''
  const statusDetail: string =
    data.header?.competitions?.[0]?.status?.type?.shortDetail ?? ''
  const isOT = /ot|overtime/i.test(statusDetail)
  const extraInningsMatch = statusDetail.match(/Final\/(\d+)/)

  if (isOT) {
    notes.push(winner ? `${winner} pulled it out in overtime` : 'Went to overtime')
  } else if (extraInningsMatch) {
    notes.push(`Went ${extraInningsMatch[1]} innings`)
  } else if (diff <= 3) {
    notes.push(winner ? `${winner} held on — decided by ${diff}` : `Decided by ${diff}`)
  } else if (diff >= 25) {
    notes.push(winner ? `${winner} dominated — won by ${diff}` : `Dominant win by ${diff}`)
  }

  return notes.slice(0, 3)
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json()

  const comp = data.header?.competitions?.[0]
  const comp2 = data.competitions?.[0]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const competitors: any[] = comp?.competitors ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const competitors2: any[] = comp2?.competitors ?? []

  const homeComp = competitors.find(c => c.homeAway === 'home') ??
                   competitors2.find(c => c.homeAway === 'home')
  const awayComp = competitors.find(c => c.homeAway === 'away') ??
                   competitors2.find(c => c.homeAway === 'away')

  const homeName: string = homeComp?.team?.shortDisplayName ?? homeComp?.team?.displayName ?? ''
  const awayName: string = awayComp?.team?.shortDisplayName ?? awayComp?.team?.displayName ?? ''
  const homeScore: number = parseInt(homeComp?.score ?? '0')
  const awayScore: number = parseInt(awayComp?.score ?? '0')

  const homeRecord: string | undefined =
    homeComp?.record?.[0]?.summary ?? homeComp?.records?.[0]?.summary
  const awayRecord: string | undefined =
    awayComp?.record?.[0]?.summary ?? awayComp?.records?.[0]?.summary

  const seriesSummary = extractSeriesSummary(comp, comp2, data)
  const notes = buildNotes(data, homeComp, awayComp, homeScore, awayScore)

  return NextResponse.json({
    homeName,
    awayName,
    homeScore,
    awayScore,
    homeRecord,
    awayRecord,
    seriesSummary,
    notes,
  } satisfies GameDetail)
}
