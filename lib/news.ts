import Parser from 'rss-parser'

export interface NewsItem {
  title: string
  link: string
  pubDate: string
  contentSnippet?: string
  source: string
}

const parser = new Parser()

const FEEDS: { url: string; source: string }[] = [
  { url: 'https://feeds.reuters.com/reuters/topNews', source: 'Reuters' },
  { url: 'https://feeds.bbci.co.uk/news/rss.xml', source: 'BBC News' },
  { url: 'https://www.theguardian.com/us/rss', source: 'The Guardian' },
  { url: 'https://feeds.npr.org/1001/rss.xml', source: 'NPR' },
  { url: 'https://www.politico.com/rss/politicopicks.xml', source: 'Politico' },
]

export async function fetchNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(({ url, source }) =>
      parser.parseURL(url).then(feed =>
        feed.items.slice(0, 8).map(item => ({
          title: item.title ?? '',
          link: item.link ?? '',
          pubDate: item.pubDate ?? '',
          contentSnippet: item.contentSnippet,
          source,
        }))
      )
    )
  )

  const items: NewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value)
  }

  const seen = new Set<string>()
  return items
    .filter(i => {
      if (!i.title || seen.has(i.title)) return false
      seen.add(i.title)
      return true
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 25)
}
