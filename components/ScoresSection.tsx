'use client'

import { useState } from 'react'
import { GameScore } from '@/lib/scores'
import { GameDetail } from '@/app/api/game/route'

const LEAGUE_ORDER = ['NBA', 'NHL', 'MLB', 'NFL', 'NCAAM', 'NCAAW']

function GameCard({ game }: { game: GameScore }) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<GameDetail | null>(null)
  const [loading, setLoading] = useState(false)

  const awayWon = game.awayScore > game.homeScore
  const homeWon = game.homeScore > game.awayScore
  const isHighlight = !!game.highlight

  async function toggle() {
    if (open) { setOpen(false); return }
    setOpen(true)
    if (detail || !game.gameId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/game?id=${game.gameId}&league=${game.league}`)
      if (res.ok) setDetail(await res.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`rounded-xl text-xs cursor-pointer transition-colors ${
        isHighlight ? 'bg-blue-950 border border-blue-800' : 'bg-gray-900 hover:bg-gray-800'
      }`}
    >
      <div className="px-3 py-2" onClick={toggle}>
        <div className="flex justify-between items-center">
          <span className={awayWon ? 'text-white font-semibold' : 'text-gray-400'}>{game.away}</span>
          <div className="flex items-center gap-1.5">
            <span className={awayWon ? 'text-white font-bold tabular-nums' : 'text-gray-400 tabular-nums'}>{game.awayScore}</span>
            <svg className={`w-3 h-3 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <span className={homeWon ? 'text-white font-semibold' : 'text-gray-400'}>{game.home}</span>
          <span className={homeWon ? 'text-white font-bold tabular-nums' : 'text-gray-400 tabular-nums'}>{game.homeScore}</span>
        </div>
        <p className="text-gray-600 text-xs mt-1">{game.status}{isHighlight ? ` · ${game.highlight}` : ''}</p>
      </div>

      {open && (
        <div className="px-3 pb-3 border-t border-gray-800 pt-2 space-y-2">
          {loading && <p className="text-gray-500 text-xs">Loading...</p>}

          {detail && (
            <>
              {detail.seriesSummary && (
                <p className="text-blue-400 text-xs font-medium">{detail.seriesSummary}</p>
              )}

              {detail.linescores.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs tabular-nums">
                    <thead>
                      <tr>
                        <th className="text-left text-gray-500 font-normal pr-2 py-0.5 w-16"></th>
                        {detail.linescores.map(ls => (
                          <th key={ls.label} className="text-gray-500 font-normal text-center px-1 py-0.5">{ls.label}</th>
                        ))}
                        <th className="text-gray-500 font-normal text-center px-1 py-0.5">T</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-gray-400 pr-2 py-0.5 truncate max-w-[4rem]">{detail.awayName}</td>
                        {detail.linescores.map((ls, i) => (
                          <td key={i} className="text-center px-1 py-0.5 text-gray-300">{ls.away}</td>
                        ))}
                        <td className={`text-center px-1 py-0.5 font-bold ${detail.awayScore > detail.homeScore ? 'text-white' : 'text-gray-400'}`}>{detail.awayScore}</td>
                      </tr>
                      <tr>
                        <td className="text-gray-400 pr-2 py-0.5 truncate max-w-[4rem]">{detail.homeName}</td>
                        {detail.linescores.map((ls, i) => (
                          <td key={i} className="text-center px-1 py-0.5 text-gray-300">{ls.home}</td>
                        ))}
                        <td className={`text-center px-1 py-0.5 font-bold ${detail.homeScore > detail.awayScore ? 'text-white' : 'text-gray-400'}`}>{detail.homeScore}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex gap-3 text-gray-500 text-xs">
                {detail.awayRecord && <span>{detail.awayName}: {detail.awayRecord}</span>}
                {detail.homeRecord && <span>{detail.homeName}: {detail.homeRecord}</span>}
              </div>

              {detail.leaders.length > 0 && (
                <div className="space-y-0.5">
                  {detail.leaders.map((l, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-gray-300">{l.shortName}</span>
                      <span className="text-gray-500">{l.stat}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function ScoresSection({ games }: { games: GameScore[] }) {
  if (games.length === 0) return null

  const byLeague = LEAGUE_ORDER.map(league => ({
    league,
    games: games.filter(g => g.league === league),
  })).filter(g => g.games.length > 0)

  return (
    <div className="space-y-4">
      {byLeague.map(({ league, games }) => (
        <div key={league}>
          <p className="text-xs text-gray-500 mb-2">{league}</p>
          <div className="grid grid-cols-2 gap-2">
            {games.map((game, i) => <GameCard key={i} game={game} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
