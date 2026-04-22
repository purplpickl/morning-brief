'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { GameScore } from '@/lib/scores'
import { GameDetail } from '@/app/api/game/route'

const LEAGUE_ORDER = ['NBA', 'NHL', 'MLB', 'NFL', 'NCAAM', 'NCAAW']
const DISMISS_THRESHOLD = 100 // px

function GameSheet({ game, onClose }: { game: GameScore; onClose: () => void }) {
  const [detail, setDetail] = useState<GameDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)

  useEffect(() => {
    if (!game.gameId) { setLoading(false); return }
    fetch(`/api/game?id=${game.gameId}&league=${game.league}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setDetail(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [game.gameId, game.league])

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
    if (dragY > DISMISS_THRESHOLD) {
      onClose()
    } else {
      setDragY(0)
    }
  }, [dragY, onClose])

  const awayWon = game.awayScore > game.homeScore
  const homeWon = game.homeScore > game.awayScore

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ opacity: Math.max(0, 1 - dragY / 300) }}
      />
      <div
        className="relative w-full rounded-t-2xl px-5 pt-4 pb-10 max-h-[82vh] overflow-y-auto animate-slide-up"
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
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <span className="font-label text-[10px] text-muted tracking-wider uppercase">{game.league}</span>
            {game.playoffNote && (
              <span className="font-label text-[10px] px-2 py-0.5" style={{ border: '1px solid rgba(96,165,250,0.5)', color: '#93c5fd' }}>
                {game.playoffNote}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink p-1 -mr-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Big score */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-editorial text-xl font-bold ${awayWon ? 'text-ink' : 'text-muted'}`}>{game.away}</p>
              {detail?.awayRecord && <p className="font-label text-[10px] text-muted mt-0.5">{detail.awayRecord}</p>}
            </div>
            <p className={`font-editorial text-4xl font-bold tabular-nums ${awayWon ? 'text-ink' : 'text-muted'}`}>
              {game.awayScore}
            </p>
          </div>
          <div style={{ borderTop: '1px solid rgba(236,228,211,0.25)' }} />
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-editorial text-xl font-bold ${homeWon ? 'text-ink' : 'text-muted'}`}>{game.home}</p>
              {detail?.homeRecord && <p className="font-label text-[10px] text-muted mt-0.5">{detail.homeRecord}</p>}
            </div>
            <p className={`font-editorial text-4xl font-bold tabular-nums ${homeWon ? 'text-ink' : 'text-muted'}`}>
              {game.homeScore}
            </p>
          </div>
        </div>

        <p className="font-label text-[10px] text-muted mb-4 tracking-wider">{game.status}</p>

        {detail?.seriesSummary && (
          <div className="px-4 py-2.5 mb-4" style={{ border: '1px solid rgba(96,165,250,0.35)', background: 'rgba(30,58,138,0.15)' }}>
            <p className="font-label text-[11px] font-semibold" style={{ color: '#93c5fd' }}>{detail.seriesSummary}</p>
          </div>
        )}

        {loading && (
          <p className="font-label text-xs text-muted text-center py-4">Loading...</p>
        )}

        {detail && detail.notes.length > 0 && (
          <div className="space-y-2">
            {detail.notes.map((note, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="font-label text-[10px] text-muted mt-[3px] shrink-0">—</span>
                <p className="font-body-serif text-[14px] text-ink leading-snug">{note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GameCard({ game, onClick }: { game: GameScore; onClick: () => void }) {
  const awayWon = game.awayScore > game.homeScore
  const homeWon = game.homeScore > game.awayScore
  const isHighlight = !!game.highlight

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2.5 py-2 text-xs transition-opacity active:opacity-60"
      style={{
        border: isHighlight
          ? '1px solid rgba(96,165,250,0.5)'
          : '1px solid rgba(236,228,211,0.2)',
        background: isHighlight ? 'rgba(30,58,138,0.2)' : 'transparent',
      }}
    >
      <div className="flex justify-between items-center">
        <span className={`font-body-serif text-[13px] ${awayWon ? 'text-ink font-semibold' : 'text-muted'}`}>{game.away}</span>
        <span className={`font-editorial tabular-nums text-[14px] font-bold ${awayWon ? 'text-ink' : 'text-muted'}`}>{game.awayScore}</span>
      </div>
      <div className="flex justify-between items-center mt-0.5">
        <span className={`font-body-serif text-[13px] ${homeWon ? 'text-ink font-semibold' : 'text-muted'}`}>{game.home}</span>
        <span className={`font-editorial tabular-nums text-[14px] font-bold ${homeWon ? 'text-ink' : 'text-muted'}`}>{game.homeScore}</span>
      </div>
      <p className="font-label text-[9px] text-muted/60 mt-1.5 tracking-wider">
        {game.status}
        {isHighlight ? ` · ${game.highlight}` : ''}
        {game.playoffNote ? ` · ${game.playoffNote}` : ''}
      </p>
      {game.seriesSummary && (
        <p className="font-label text-[9px] mt-1 tracking-wider" style={{ color: '#93c5fd' }}>
          {game.seriesSummary}
        </p>
      )}
    </button>
  )
}

const DEFAULT_GAMES = 4

function LeagueScores({
  league,
  games,
  onSelect,
}: {
  league: string
  games: GameScore[]
  onSelect: (g: GameScore) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? games : games.slice(0, DEFAULT_GAMES)
  const hasMore = games.length > DEFAULT_GAMES

  return (
    <div>
      <p className="league-head">{league}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {visible.map((game, i) => (
          <GameCard key={i} game={game} onClick={() => onSelect(game)} />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-2 font-label text-[11px] tracking-wider uppercase text-muted hover:text-ink transition-colors"
          style={{ borderBottom: '1px solid rgba(148,138,121,0.5)', paddingBottom: '1px' }}
        >
          {expanded ? 'Show less' : 'See more'}
        </button>
      )}
    </div>
  )
}

export default function ScoresSection({ games }: { games: GameScore[] }) {
  const [selected, setSelected] = useState<GameScore | null>(null)

  if (games.length === 0) {
    return <p className="font-label text-xs text-muted italic">No games yesterday.</p>
  }

  const byLeague = LEAGUE_ORDER.map(league => ({
    league,
    games: games.filter(g => g.league === league),
  })).filter(g => g.games.length > 0)

  return (
    <>
      <div className="space-y-4">
        {byLeague.map(({ league, games }) => (
          <LeagueScores key={league} league={league} games={games} onSelect={setSelected} />
        ))}
      </div>

      {selected && (
        <GameSheet game={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
