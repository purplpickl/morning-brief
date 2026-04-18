'use client'

import { StockQuote } from '@/lib/stocks'

function formatPrice(price: number, symbol: string): string {
  const isCrypto = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'LINK-USD', 'ADA-USD'].some(s =>
    symbol.includes(s)
  )
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (isCrypto && price < 1) return price.toFixed(4)
  return price.toFixed(2)
}

export default function StocksSection({ stocks }: { stocks: StockQuote[] }) {
  const indices = stocks.filter(s =>
    ['NASDAQ', 'S&P 500', 'NYSE', 'Dow Jones'].includes(s.symbol)
  )
  const equities = stocks.filter(s =>
    !['NASDAQ', 'S&P 500', 'NYSE', 'Dow Jones'].includes(s.symbol) &&
    !['BTC-USD', 'ETH-USD', 'SOL-USD', 'LINK-USD', 'ADA-USD'].some(c => s.symbol === c) &&
    !['VDIGX', 'VIGAX', 'VTI'].includes(s.symbol)
  )
  const crypto = stocks.filter(s =>
    ['BTC-USD', 'ETH-USD', 'SOL-USD', 'LINK-USD', 'ADA-USD'].includes(s.symbol)
  )
  const funds = stocks.filter(s => ['VDIGX', 'VIGAX', 'VTI'].includes(s.symbol))

  const groups = [
    { label: 'Indices', items: indices },
    { label: 'Stocks', items: equities },
    { label: 'Crypto', items: crypto },
    { label: 'Funds', items: funds },
  ].filter(g => g.items.length > 0)

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Stocks</h2>
      <div className="space-y-4">
        {groups.map(({ label, items }) => (
          <div key={label}>
            <p className="text-xs text-gray-500 mb-2">{label}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map(stock => {
                const up = stock.change >= 0
                return (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{stock.symbol}</p>
                      <p className="text-xs text-gray-400 truncate">{stock.shortName}</p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="font-semibold text-white text-sm">
                        {formatPrice(stock.price, stock.symbol)}
                      </p>
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                          up ? 'bg-green-900/60 text-green-400' : 'bg-red-900/60 text-red-400'
                        }`}
                      >
                        {up ? '+' : ''}{stock.change.toFixed(2)} ({up ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
