import { fetchStockQuotes } from '@/lib/stocks'
import { fetchWSJNews } from '@/lib/wsj'
import { fetchFTNews } from '@/lib/ft'
import { fetchSportsNews } from '@/lib/sports'
import { fetchDailyReads } from '@/lib/gmail'
import { fetchYesterdayScores } from '@/lib/scores'
import StocksSection from '@/components/StocksSection'
import NewsSection from '@/components/NewsSection'
import SportsSection from '@/components/SportsSection'
import GmailSection from '@/components/GmailSection'
import QuickLinks from '@/components/QuickLinks'
import WeatherSection from '@/components/WeatherSection'
import ScoresSection from '@/components/ScoresSection'
import CollapsibleSection from '@/components/CollapsibleSection'

export const revalidate = 3600

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default async function Home() {
  const [stocks, wsj, ft, sports, gmail, scores] = await Promise.allSettled([
    fetchStockQuotes(),
    fetchWSJNews(),
    fetchFTNews(),
    fetchSportsNews(),
    fetchDailyReads(),
    fetchYesterdayScores(),
  ])

  const stockData = stocks.status === 'fulfilled' ? stocks.value : []
  const wsjData  = wsj.status   === 'fulfilled' ? wsj.value   : []
  const ftData   = ft.status    === 'fulfilled' ? ft.value    : []
  const sportsData = sports.status === 'fulfilled' ? sports.value : []
  const gmailData  = gmail.status  === 'fulfilled' ? gmail.value  : []
  const scoresData = scores.status === 'fulfilled' ? scores.value : []

  // Merge FT + WSJ, sort newest first
  const newsData = [...ftData, ...wsjData].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )

  const hasSports = sportsData.length > 0 || scoresData.length > 0

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Good morning, Jacob.</h1>
          <p className="text-gray-400 text-sm mt-0.5">{formatDate()}</p>
        </div>

        <WeatherSection />

        <QuickLinks />

        {newsData.length > 0 && (
          <CollapsibleSection title="News" badge={newsData.length}>
            <NewsSection items={newsData} />
          </CollapsibleSection>
        )}

        <CollapsibleSection title="Daily Reads" badge={gmailData.length || undefined}>
          <GmailSection threads={gmailData} />
        </CollapsibleSection>

        {hasSports && (
          <CollapsibleSection title="Sports" badge={scoresData.length + sportsData.length || undefined}>
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Yesterday&apos;s Scores</p>
              <ScoresSection games={scoresData} />
              {sportsData.length > 0 && <div className="border-t border-gray-800 mt-4" />}
            </div>
            {sportsData.length > 0 && <SportsSection items={sportsData} />}
          </CollapsibleSection>
        )}

        {stockData.length > 0 && (
          <CollapsibleSection title="Stocks">
            <StocksSection stocks={stockData} />
          </CollapsibleSection>
        )}

        <p className="text-center text-gray-600 text-xs pb-4">
          Refreshed daily at 6am ET
        </p>
      </div>
    </main>
  )
}
