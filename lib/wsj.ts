import Parser from 'rss-parser'

export interface NewsItem {
  title: string
  link: string
  pubDate: string
  contentSnippet?: string
}

const parser = new Parser()

const WSJ_FEEDS = [
  'https://feeds.content.dowjones.io/public/rss/RSSMarketsMain',
  'https://feeds.content.dowjones.io/public/rss/RSSOpinion',
]

export async function fetchWSJNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    WSJ_FEEDS.map(url => parser.parseURL(url))
  )

  const items: NewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const item of r.value.items.slice(0, 6)) {
        items.push({
          title: item.title ?? '',
          link: item.link ?? '',
          pubDate: item.pubDate ?? '',
          contentSnippet: item.contentSnippet,
        })
      }
    }
  }

  // dedupe by title, sort newest first
  const seen = new Set<string>()
  return items
    .filter(i => {
      if (seen.has(i.title)) return false
      seen.add(i.title)
      return true
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 10)
}
