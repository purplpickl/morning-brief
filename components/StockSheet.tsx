'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface ChartPoint { t: number; c: number }
interface ChartData {
  points: ChartPoint[]
  meta: { previousClose: number; currency: string; regularMarketTime: number }
}

function SparkChart({ points, previousClose }: { points: ChartPoint[]; previousClose: number }) {
  if (points.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center">
        <span className="font-label text-xs text-muted">No chart data</span>
      </div>
    )
  }

  const prices = points.map(p => p.c)
  const allPrices = [...prices, previousClose]
  const min = Math.min(...allPrices) * 0.9985
  const max = Math.max(...allPrices) * 1.0015
  const range = max - min || 1

  const W = 400
  const H = 100
  const toX = (i: number) => (i / (points.length - 1)) * W
  const toY = (p: number) => H - ((p - min) / range) * H

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.c).toFixed(1)}`).join(' ')
  const prevY = toY(previousClose).toFixed(1)
  const lastPrice = prices[prices.length - 1]
  const isUp = lastPrice >= previousClose
  const color = isUp ? '#7fd39e' : '#e07a7a'

  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '130px' }}>
        <line x1="0" y1={prevY} x2={W} y2={prevY} stroke="rgba(236,228,211,0.2)" strokeWidth="1" strokeDasharray="4,3" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={toX(points.length - 1).toFixed(1)} cy={toY(lastPrice).toFixed(1)} r="3" fill={color} />
      </svg>
      <div className="flex justify-between font-label text-[9px] text-muted mt-1">
        <span>{fmtTime(points[0].t)}</span>
        <span>{fmtTime(points[points.length - 1].t)}</span>
      </div>
    </div>
  )
}

export default function StockSheet({
  symbol,
  originalSymbol,
  name,
  onClose,
}: {
  symbol: string
  originalSymbol: string
  name: string
  onClose: () => void
}) {
  const [data, setData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)

  useEffect(() => {
    fetch(`/api/stock?symbol=${encodeURIComponent(originalSymbol)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [originalSymbol])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    setDragging(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 0) setDragY(delta)
  }, [dragging])

  const handleTouchEnd = useCallback(() => {
    setDragging(false)
    if (dragY > 100) onClose()
    else setDragY(0)
  }, [dragY, onClose])

  const points = data?.points ?? []
  const prevClose = data?.meta.previousClose ?? 0
  const lastPrice = points[points.length - 1]?.c ?? 0
  const chg = lastPrice - prevClose
  const pct = prevClose ? (chg / prevClose) * 100 : 0
  const isUp = chg >= 0

  const fmtPrice = (p: number) =>
    p >= 1000
      ? p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : p.toFixed(2)

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ opacity: Math.max(0, 1 - dragY / 300) }}
      />
      <div
        className="relative w-full rounded-t-2xl px-5 pt-4 pb-10 max-h-[75vh] overflow-y-auto animate-slide-up"
        style={{
          background: '#1a1714',
          borderTop: '1px solid rgba(236,228,211,0.35)',
          transform: `translateY(${dragY}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease',
        }}
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />

        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-editorial text-xl font-bold text-ink">{symbol}</p>
            <p className="font-label text-[10px] text-muted mt-0.5 truncate max-w-[220px]">{name}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink p-1 -mr-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <p className="font-label text-xs text-muted">Loading chart...</p>
          </div>
        ) : (
          <>
            {lastPrice > 0 && (
              <div className="mb-4">
                <p className="font-editorial text-3xl font-bold text-ink">{fmtPrice(lastPrice)}</p>
                <p className={`font-label text-[12px] font-semibold mt-1 ${isUp ? 'text-up' : 'text-down'}`}>
                  {isUp ? '+' : ''}{fmtPrice(chg)} ({isUp ? '+' : ''}{pct.toFixed(2)}%) today
                </p>
              </div>
            )}
            <SparkChart points={points} previousClose={prevClose} />
            {prevClose > 0 && (
              <p className="font-label text-[10px] text-muted mt-3">
                Prev close: {fmtPrice(prevClose)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
