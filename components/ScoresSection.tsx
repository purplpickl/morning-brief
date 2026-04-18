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
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
        Yesterday&apos;s Scores
      </h2>
      <div className="space-y-4">
        {byLeague.map(({ league, games }) => (
          <div key={league}>
            <p className="text-xs text-gray-500 mb-2">{league}</p>
            <div className="space-y-1.5">
              {games.map((game, i) => {
                const awayWon = game.awayScore > game.homeScore
                const homeWon = game.homeScore > game.awayScore
                const isHighlight = !!game.highlight

                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm ${
                      isHighlight ? 'bg-blue-950 border border-blue-800' : 'bg-gray-900'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        {/* Away */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-medium truncate ${awayWon ? 'text-white' : 'text-gray-400'}`}>
                            {game.away}
                          </span>
                          <span className={`font-bold tabular-nums ${awayWon ? 'text-white' : 'text-gray-400'}`}>
                            {game.awayScore}
                          </span>
                        </div>
                        <span className="text-gray-600 text-xs shrink-0">@</span>
                        {/* Home */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-bold tabular-nums ${homeWon ? 'text-white' : 'text-gray-400'}`}>
                            {game.homeScore}
                          </span>
                          <span className={`font-medium truncate ${homeWon ? 'text-white' : 'text-gray-400'}`}>
                            {game.home}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{game.status}</p>
                    </div>
                    {isHighlight && (
                      <span className="ml-3 text-xs text-blue-400 font-medium shrink-0">{game.highlight}</span>
                    )}
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
