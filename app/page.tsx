import { fetchStockQuotes } from '@/lib/stocks'
import { fetchWSJNews } from '@/lib/wsj'
import { fetchFTNews } from '@/lib/ft'
import { fetchSportsNews } from '@/lib/sports'
import { fetchDailyReads } from '@/lib/gmail'
import { fetchYesterdayScores } from '@/lib/scores'
import { fetchGoogleCalendar } from '@/lib/gcal'
import { fetchOutlookCalendar } from '@/lib/outlook'
import StocksSection from '@/components/StocksSection'
import NewsSection from '@/components/NewsSection'
import SportsSection from '@/components/SportsSection'
import GmailSection from '@/components/GmailSection'
import QuickLinks from '@/components/QuickLinks'
import WeatherSection from '@/components/WeatherSection'
import LocationLabel from '@/components/LocationLabel'
import ScoresSection from '@/components/ScoresSection'
import CalendarSection from '@/components/CalendarSection'
import GlanceSection from '@/components/GlanceSection'

export const revalidate = 3600

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function SectionHead({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="section-head">
      <h3>{title}</h3>
      {meta && <span>{meta}</span>}
    </div>
  )
}

export default async function Home() {
  const [stocks, wsj, ft, sports, gmail, scores, gcal, outlook] = await Promise.allSettled([
    fetchStockQuotes(),
    fetchWSJNews(),
    fetchFTNews(),
    fetchSportsNews(),
    fetchDailyReads(),
    fetchYesterdayScores(),
    fetchGoogleCalendar(),
    fetchOutlookCalendar(),
  ])

  const stockData   = stocks.status   === 'fulfilled' ? stocks.value   : []
  const wsjData     = wsj.status      === 'fulfilled' ? wsj.value      : []
  const ftData      = ft.status       === 'fulfilled' ? ft.value       : []
  const sportsData  = sports.status   === 'fulfilled' ? sports.value   : []
  const gmailData   = gmail.status    === 'fulfilled' ? gmail.value    : []
  const scoresData  = scores.status   === 'fulfilled' ? scores.value   : []
  const gcalData    = gcal.status     === 'fulfilled' ? gcal.value     : []
  const outlookData = outlook.status  === 'fulfilled' ? outlook.value  : []

  const newsData = [...ftData, ...wsjData].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )

  const calEvents = [...gcalData, ...outlookData].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  const hasSports = scoresData.length > 0 || sportsData.length > 0

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div
        className="mx-auto pb-20"
        style={{ maxWidth: '1400px', padding: '0 clamp(20px, 4vw, 64px) 80px' }}
      >

        {/* ── Masthead ──────────────────────────────────────────────────── */}
        <div
          className="text-center pt-8 pb-6"
          style={{ borderBottom: '1px solid rgba(236,228,211,0.35)' }}
        >
          {/* Edition line */}
          <div className="flex justify-between items-center mb-4">
            <span className="font-label text-[11px] tracking-[0.14em] uppercase text-muted hidden md:inline">
              Morning Edition
            </span>
            <span className="font-label text-[11px] tracking-[0.06em] text-muted">
              {formatDate()}
            </span>
            <span className="font-label text-[11px] tracking-[0.14em] uppercase text-muted text-right">
              <LocationLabel />
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-masthead leading-none tracking-tight"
            style={{ fontSize: 'clamp(52px, 8vw, 104px)' }}
          >
            The Daily Jacob
          </h1>
        </div>

        {/* ── At a Glance ───────────────────────────────────────────────── */}
        <GlanceSection calEvents={calEvents} stocks={stockData} />

        {/* ── 3-col row: Weather | Calendar | Quick Links ───────────────── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ borderBottom: '1px solid rgba(236,228,211,0.35)' }}
        >
          {/* Weather */}
          <div
            className="py-5 md:pr-6 border-b md:border-b-0 md:border-r"
            style={{ borderColor: 'rgba(236,228,211,0.35)' }}
          >
            <p className="col-label">Weather</p>
            <WeatherSection />
          </div>

          {/* Calendar */}
          <div
            className="py-5 md:px-6 border-b md:border-b-0 md:border-r"
            style={{ borderColor: 'rgba(236,228,211,0.35)' }}
          >
            <p className="col-label">Today&apos;s Schedule</p>
            <CalendarSection events={calEvents} />
          </div>

          {/* Quick Links */}
          <div className="py-5 md:pl-6">
            <p className="col-label">Quick Access</p>
            <QuickLinks />
          </div>
        </div>

        {/* ── News ──────────────────────────────────────────────────────── */}
        {newsData.length > 0 && (
          <>
            <SectionHead title="News" meta={`${newsData.length} stories`} />
            <NewsSection items={newsData} />
          </>
        )}

        {/* ── Daily Reads ───────────────────────────────────────────────── */}
        {gmailData.length > 0 && (
          <>
            <SectionHead title="Daily Reads" meta={`${gmailData.length} newsletters`} />
            <GmailSection threads={gmailData} />
          </>
        )}

        {/* ── Sports ────────────────────────────────────────────────────── */}
        {hasSports && (
          <>
            <SectionHead title="Sports" />
            <div
              className={`grid gap-10 grid-cols-1 ${sportsData.length > 0 ? 'md:grid-cols-2' : ''}`}
            >
              <div>
                <p className="col-label">Yesterday&apos;s Scores</p>
                <ScoresSection games={scoresData} />
              </div>
              {sportsData.length > 0 && (
                <div>
                  <p className="col-label">Latest</p>
                  <SportsSection items={sportsData} />
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Markets ───────────────────────────────────────────────────── */}
        {stockData.length > 0 && (
          <>
            <SectionHead title="Markets" />
            <StocksSection stocks={stockData} />
          </>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div
          className="flex justify-between items-center mt-16 pt-4 font-label text-[10px] text-muted italic"
          style={{ borderTop: '1px solid rgba(236,228,211,0.2)' }}
        >
          <span>Refreshed daily at 6am ET</span>
          <span>The Daily Jacob — Personal Edition</span>
        </div>

      </div>
    </main>
  )
}
