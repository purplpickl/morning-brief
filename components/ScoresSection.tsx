'use client'

import { GameScore } from '@/lib/scores'

const LEAGUE_ORDER = ['NBA', 'NHL', 'MLB', 'NFL', 'NCAAM', 'NCAAW']

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
              {games.map((game, i) => {
                const awayWon = game.awayScore > game.homeScore
                const homeWon = game.homeScore > game.awayScore
                const isHighlight = !!game.highlight

                return (
                  <div
                    key={i}
                    className={`px-3 py-2 rounded-xl text-xs ${
                      isHighlight ? 'bg-blue-950 border border-blue-800' : 'bg-gray-900'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={awayWon ? 'text-white font-semibold' : 'text-gray-400'}>{game.away}</span>
                      <span className={awayWon ? 'text-white font-bold tabular-nums' : 'text-gray-400 tabular-nums'}>{game.awayScore}</span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className={homeWon ? 'text-white font-semibold' : 'text-gray-400'}>{game.home}</span>
                      <span className={homeWon ? 'text-white font-bold tabular-nums' : 'text-gray-400 tabular-nums'}>{game.homeScore}</span>
                    </div>
                    <p className="text-gray-600 text-xs mt-1">{game.status}{isHighlight ? ` · ${game.highlight}` : ''}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
    </div>
  )
}
