import { fetchStockQuotes } from '@/lib/stocks'
import { fetchWSJNews } from '@/lib/wsj'
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

export const revalidate = 3600

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default async function Home() {
  const [stocks, news, sports, gmail, scores] = await Promise.allSettled([
    fetchStockQuotes(),
    fetchWSJNews(),
    fetchSportsNews(),
    fetchDailyReads(),
    fetchYesterdayScores(),
  ])

  const stockData = stocks.status === 'fulfilled' ? stocks.value : []
  const newsData = news.status === 'fulfilled' ? news.value : []
  const sportsData = sports.status === 'fulfilled' ? sports.value : []
  const gmailData = gmail.status === 'fulfilled' ? gmail.value : []
  const scoresData = scores.status === 'fulfilled' ? scores.value : []

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Good morning, Jacob.</h1>
          <p className="text-gray-400 text-sm mt-0.5">{formatDate()}</p>
        </div>

        <WeatherSection />

        <QuickLinks />

        {newsData.length > 0 && <NewsSection items={newsData} />}

        <GmailSection threads={gmailData} />

        <ScoresSection games={scoresData} />

        {sportsData.length > 0 && <SportsSection items={sportsData} />}

        {stockData.length > 0 && <StocksSection stocks={stockData} />}

        <p className="text-center text-gray-600 text-xs pb-4">
          Refreshed daily at 6am ET
        </p>
      </div>
    </main>
  )
}
