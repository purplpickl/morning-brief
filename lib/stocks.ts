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

export async function fetchStockQuotes(): Promise<StockQuote[]> {
  const encoded = encodeURIComponent(SYMBOLS.join(','))
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encoded}&fields=shortName,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
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
