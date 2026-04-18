import Parser from 'rss-parser'

export interface SportsItem {
  title: string
  link: string
  pubDate: string
  contentSnippet?: string
  source?: string
}

const parser = new Parser()

const SPORTS_FEEDS = [
  { url: 'https://www.espn.com/espn/rss/news', source: 'ESPN' },
  { url: 'https://www.espn.com/espn/rss/nfl/news', source: 'ESPN NFL' },
  { url: 'https://www.espn.com/espn/rss/nba/news', source: 'ESPN NBA' },
]

export async function fetchSportsNews(): Promise<SportsItem[]> {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000

  const results = await Promise.allSettled(
    SPORTS_FEEDS.map(({ url, source }) =>
      parser.parseURL(url).then(feed =>
        feed.items.map(item => ({
          title: item.title ?? '',
          link: item.link ?? '',
          pubDate: item.pubDate ?? '',
          contentSnippet: item.contentSnippet,
          source,
        }))
      )
    )
  )

  const items: SportsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value)
  }

  const seen = new Set<string>()
  return items
    .filter(i => {
      if (!i.pubDate || new Date(i.pubDate).getTime() < cutoff) return false
      if (seen.has(i.title)) return false
      seen.add(i.title)
      return true
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 10)
}
