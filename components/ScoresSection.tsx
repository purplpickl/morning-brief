'use client'

import { useState, useEffect } from 'react'
import { GameScore } from '@/lib/scores'
import { GameDetail } from '@/app/api/game/route'

const LEAGUE_ORDER = ['NBA', 'NHL', 'MLB', 'NFL', 'NCAAM', 'NCAAW']

function GameSheet({ game, onClose }: { game: GameScore; onClose: () => void }) {
  const [detail, setDetail] = useState<GameDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!game.gameId) { setLoading(false); return }
    fetch(`/api/game?id=${game.gameId}&league=${game.league}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setDetail(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [game.gameId, game.league])

  // Lock body scroll while sheet is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const awayWon = game.awayScore > game.homeScore
  const homeWon = game.homeScore > game.awayScore

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full bg-gray-950 border-t border-gray-800 rounded-t-2xl px-5 pt-4 pb-8 max-h-[82vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <span className="text-xs text-gray-500 uppercase tracking-wider">{game.league}</span>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 -mr-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Big score */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xl font-bold ${awayWon ? 'text-white' : 'text-gray-500'}`}>{game.away}</p>
              {detail?.awayRecord && <p className="text-xs text-gray-500 mt-0.5">{detail.awayRecord}</p>}
            </div>
            <p className={`text-4xl font-bold tabular-nums ${awayWon ? 'text-white' : 'text-gray-500'}`}>
              {game.awayScore}
            </p>
          </div>
          <div className="border-t border-gray-800" />
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xl font-bold ${homeWon ? 'text-white' : 'text-gray-500'}`}>{game.home}</p>
              {detail?.homeRecord && <p className="text-xs text-gray-500 mt-0.5">{detail.homeRecord}</p>}
            </div>
            <p className={`text-4xl font-bold tabular-nums ${homeWon ? 'text-white' : 'text-gray-500'}`}>
              {game.homeScore}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">{game.status}</p>

        {detail?.seriesSummary && (
          <div className="bg-blue-950 border border-blue-800 rounded-xl px-4 py-2.5 mb-4">
            <p className="text-blue-300 text-sm font-medium">{detail.seriesSummary}</p>
          </div>
        )}

        {loading && (
          <p className="text-gray-500 text-sm text-center py-4">Loading details...</p>
        )}

        {detail && detail.linescores.length > 0 && (
          <div className="bg-gray-900 rounded-xl px-4 py-3 mb-4 overflow-x-auto">
            <table className="w-full text-xs tabular-nums">
              <thead>
                <tr>
                  <th className="text-left text-gray-500 font-normal pr-3 py-1 w-20" />
                  {detail.linescores.map(ls => (
                    <th key={ls.label} className="text-gray-500 font-normal text-center px-2 py-1 min-w-[2rem]">
                      {ls.label}
                    </th>
                  ))}
                  <th className="text-gray-400 font-semibold text-center px-2 py-1 min-w-[2rem]">T</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-gray-400 pr-3 py-1 truncate max-w-[5rem]">{detail.awayName || game.away}</td>
                  {detail.linescores.map((ls, i) => (
                    <td key={i} className="text-center px-2 py-1 text-gray-300">{ls.away}</td>
                  ))}
                  <td className={`text-center px-2 py-1 font-bold ${awayWon ? 'text-white' : 'text-gray-500'}`}>
                    {game.awayScore}
                  </td>
                </tr>
                <tr>
                  <td className="text-gray-400 pr-3 py-1 truncate max-w-[5rem]">{detail.homeName || game.home}</td>
                  {detail.linescores.map((ls, i) => (
                    <td key={i} className="text-center px-2 py-1 text-gray-300">{ls.home}</td>
                  ))}
                  <td className={`text-center px-2 py-1 font-bold ${homeWon ? 'text-white' : 'text-gray-500'}`}>
                    {game.homeScore}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {detail && detail.leaders.length > 0 && (
          <div className="bg-gray-900 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Leaders</p>
            <div className="space-y-1.5">
              {detail.leaders.map((l, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-300">{l.shortName}</span>
                  <span className="text-gray-500">{l.stat}</span>
                </div>
              ))}
            </div>
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
      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors active:scale-95 ${
        isHighlight ? 'bg-blue-950 border border-blue-800' : 'bg-gray-900 hover:bg-gray-800'
      }`}
    >
      <div className="flex justify-between items-center">
        <span className={awayWon ? 'text-white font-semibold' : 'text-gray-400'}>{game.away}</span>
        <span className={`tabular-nums font-bold ${awayWon ? 'text-white' : 'text-gray-400'}`}>{game.awayScore}</span>
      </div>
      <div className="flex justify-between items-center mt-0.5">
        <span className={homeWon ? 'text-white font-semibold' : 'text-gray-400'}>{game.home}</span>
        <span className={`tabular-nums font-bold ${homeWon ? 'text-white' : 'text-gray-400'}`}>{game.homeScore}</span>
      </div>
      <p className="text-gray-600 text-xs mt-1.5">
        {game.status}{isHighlight ? ` · ${game.highlight}` : ''}
      </p>
    </button>
  )
}

export default function ScoresSection({ games }: { games: GameScore[] }) {
  const [selected, setSelected] = useState<GameScore | null>(null)

  if (games.length === 0) return null

  const byLeague = LEAGUE_ORDER.map(league => ({
    league,
    games: games.filter(g => g.league === league),
  })).filter(g => g.games.length > 0)

  return (
    <>
      <div className="space-y-4">
        {byLeague.map(({ league, games }) => (
          <div key={league}>
            <p className="text-xs text-gray-500 mb-2">{league}</p>
            <div className="grid grid-cols-2 gap-2">
              {games.map((game, i) => (
                <GameCard key={i} game={game} onClick={() => setSelected(game)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <GameSheet game={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
