import Parser from 'rss-parser'
import { NewsItem } from './wsj'

const parser = new Parser()

const FT_FEEDS = [
  'https://www.ft.com/rss/home',
  'https://www.ft.com/rss/markets',
]

export async function fetchFTNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FT_FEEDS.map(url => parser.parseURL(url))
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
          source: 'FT',
        })
      }
    }
  }

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
