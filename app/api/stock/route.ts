import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  if (!symbol) return NextResponse.json({ error: 'Missing symbol' }, { status: 400 })

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d&includePrePost=false`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    next: { revalidate: 300 },
  })

  if (!res.ok) return NextResponse.json({ error: 'Yahoo Finance fetch failed' }, { status: 502 })

  const data = await res.json()
  const result = data.chart?.result?.[0]
  if (!result) return NextResponse.json({ error: 'No data' }, { status: 404 })

  const timestamps: number[] = result.timestamp ?? []
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? []

  const points = timestamps
    .map((t, i) => ({ t: t * 1000, c: closes[i] }))
    .filter((p): p is { t: number; c: number } => p.c !== null && p.c !== undefined)

  return NextResponse.json({
    points,
    meta: {
      previousClose: result.meta?.previousClose ?? result.meta?.chartPreviousClose ?? 0,
      currency: result.meta?.currency ?? 'USD',
      regularMarketTime: (result.meta?.regularMarketTime ?? 0) * 1000,
    },
  })
}
