import { UpcomingGame } from '@/lib/todaygames'

const LEAGUE_ORDER = ['NBA', 'NHL', 'MLB', 'NFL']

function formatGameTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  })
}

export default function TodayGamesSection({ games }: { games: UpcomingGame[] }) {
  if (games.length === 0) return null

  const byLeague = LEAGUE_ORDER
    .map(league => ({ league, games: games.filter(g => g.league === league) }))
    .filter(g => g.games.length > 0)

  if (byLeague.length === 0) return null

  return (
    <div className="space-y-5">
      {byLeague.map(({ league, games }) => (
        <div key={league}>
          <p className="league-head">{league}</p>
          <div className="space-y-1.5">
            {games.map((game, i) => (
              <div
                key={i}
                className="flex items-start justify-between px-2.5 py-2"
                style={{ border: '1px solid rgba(236,228,211,0.2)' }}
              >
                <div>
                  <p className="font-body-serif text-[13px] text-ink">
                    {game.away} <span className="text-muted text-[11px]">@</span> {game.home}
                  </p>
                  {(game.playoffNote || game.seriesSummary) && (
                    <p className="font-label text-[9px] tracking-wider mt-0.5" style={{ color: '#93c5fd' }}>
                      {[game.playoffNote, game.seriesSummary].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4">
                  {game.isLive ? (
                    <p className="font-label text-[10px] tracking-wider" style={{ color: '#7fd39e' }}>
                      Live
                    </p>
                  ) : (
                    <p className="font-label text-[11px] text-muted">
                      {formatGameTime(game.gameTime)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
