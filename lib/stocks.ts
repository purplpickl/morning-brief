export interface StockQuote {
  symbol: string
  shortName: string
  price: number
  change: number
  changePercent: number
  previousClose: number
}

const SYMBOLS = [
  'DDOG', 'NOW', 'CVX', 'DXC',
  '^IXIC', '^GSPC', '^NYA', '^DJI',
  'AAPL', 'META', 'NVDA',
  'BTC-USD', 'ETH-USD', 'SOL-USD', 'LINK-USD', 'ADA-USD',
  'VDIGX', 'VIGAX', 'VTI',
]

const DISPLAY_NAMES: Record<string, string> = {
  '^IXIC': 'NASDAQ',
  '^GSPC': 'S&P 500',
  '^NYA': 'NYSE',
  '^DJI': 'Dow Jones',
}

async function getYahooCrumb(): Promise<{ cookie: string; crumb: string }> {
  const cookieRes = await fetch('https://fc.yahoo.com', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    redirect: 'follow',
  })
  const cookie = cookieRes.headers.get('set-cookie')?.split(';')[0] ?? ''

  const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Cookie: cookie,
    },
  })
  const crumb = await crumbRes.text()
  return { cookie, crumb }
}

export async function fetchStockQuotes(): Promise<StockQuote[]> {
  const { cookie, crumb } = await getYahooCrumb()
  const encoded = encodeURIComponent(SYMBOLS.join(','))
  const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encoded}&crumb=${encodeURIComponent(crumb)}&fields=shortName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose`

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Cookie: cookie,
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`)

  const data = await res.json()
  const results = data?.quoteResponse?.result ?? []

  return results.map((q: Record<string, unknown>) => ({
    symbol: DISPLAY_NAMES[q.symbol as string] ?? q.symbol,
    shortName: q.shortName ?? q.symbol,
    price: q.regularMarketPrice,
    change: q.regularMarketChange,
    changePercent: q.regularMarketChangePercent,
    previousClose: q.regularMarketPreviousClose,
  }))
}
