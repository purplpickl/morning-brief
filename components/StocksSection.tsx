'use client'

import { useState } from 'react'
import { StockQuote } from '@/lib/stocks'
import StockSheet from './StockSheet'

function fmt(price: number, symbol: string): string {
  const isCrypto = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'LINK-USD', 'ADA-USD'].some(s => symbol.includes(s))
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (isCrypto && price < 1) return price.toFixed(4)
  return price.toFixed(2)
}

function ChgBadge({ chg, pct }: { chg: number; pct: number }) {
  const up = chg >= 0
  return (
    <span className={`font-label text-[11px] font-semibold ${up ? 'text-up' : 'text-down'}`}>
      {up ? '+' : ''}{chg.toFixed(2)} ({up ? '+' : ''}{pct.toFixed(2)}%)
    </span>
  )
}

export default function StocksSection({ stocks }: { stocks: StockQuote[] }) {
  const [selected, setSelected] = useState<StockQuote | null>(null)

  const indices  = stocks.filter(s => ['NASDAQ', 'S&P 500', 'NYSE', 'Dow Jones'].includes(s.symbol))
  const equities = stocks.filter(s =>
    !['NASDAQ', 'S&P 500', 'NYSE', 'Dow Jones'].includes(s.symbol) &&
    !['BTC-USD', 'ETH-USD', 'SOL-USD', 'LINK-USD', 'ADA-USD'].includes(s.originalSymbol) &&
    !['VDIGX', 'VIGAX', 'VTI'].includes(s.originalSymbol)
  )
  const crypto = stocks.filter(s => ['BTC-USD', 'ETH-USD', 'SOL-USD', 'LINK-USD', 'ADA-USD'].includes(s.originalSymbol))
  const funds  = stocks.filter(s => ['VDIGX', 'VIGAX', 'VTI'].includes(s.originalSymbol))

  return (
    <>
      <div>
        {/* Indices */}
        {indices.length > 0 && (
          <div
            className="grid grid-cols-2 md:grid-cols-4 pb-5 mb-5"
            style={{ gap: '16px', borderBottom: '1px solid rgba(236,228,211,0.35)' }}
          >
            {indices.map(s => (
              <button
                key={s.symbol}
                onClick={() => setSelected(s)}
                className="text-left transition-opacity active:opacity-60"
                style={{ border: '1px solid rgba(236,228,211,0.2)', padding: '10px 12px' }}
              >
                <p className="font-label text-[10px] text-muted tracking-wider uppercase mb-1">{s.symbol}</p>
                <p className="font-editorial text-xl font-semibold text-ink">{fmt(s.price, s.symbol)}</p>
                <ChgBadge chg={s.change} pct={s.changePercent} />
              </button>
            ))}
          </div>
        )}

        {/* Holdings table */}
        {[
          { label: 'Equities', items: equities },
          { label: 'Crypto',   items: crypto },
          { label: 'Funds',    items: funds },
        ].filter(g => g.items.length > 0).map(({ label, items }) => (
          <div key={label} className="mb-6">
            <p className="font-label text-[10px] text-muted tracking-wider uppercase mb-2">{label}</p>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse', minWidth: '320px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(236,228,211,0.35)' }}>
                    {['Ticker', 'Name', 'Last', '1D Chg / %'].map(h => (
                      <th
                        key={h}
                        className="font-label text-[10px] text-muted tracking-wider text-left pb-1.5"
                        style={{ fontWeight: 600, paddingRight: h === '1D Chg / %' ? 0 : '24px' }}
                        align={h === 'Last' || h === '1D Chg / %' ? 'right' : 'left'}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(s => (
                    <tr
                      key={s.symbol}
                      onClick={() => setSelected(s)}
                      className="cursor-pointer transition-opacity active:opacity-60"
                      style={{ borderBottom: '1px dotted rgba(236,228,211,0.2)' }}
                    >
                      <td className="font-label text-[12px] font-semibold text-ink py-2 pr-6">{s.symbol}</td>
                      <td className="text-[12px] text-muted py-2 pr-6 truncate max-w-[160px]">{s.shortName}</td>
                      <td className="font-editorial text-[13px] text-ink py-2 pr-6 text-right tabular-nums">
                        {fmt(s.price, s.symbol)}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        <ChgBadge chg={s.change} pct={s.changePercent} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <StockSheet
          symbol={selected.symbol}
          originalSymbol={selected.originalSymbol}
          name={selected.shortName}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
