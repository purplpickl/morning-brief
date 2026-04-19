import Parser from 'rss-parser'

export interface AINewsItem {
  title: string
  link: string
  pubDate: string
  contentSnippet?: string
  source: string
}

const parser = new Parser()

const FEEDS: { url: string; source: string }[] = [
  { url: 'https://www.technologyreview.com/feed/', source: 'MIT Tech Review' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat' },
  { url: 'https://www.wired.com/feed/tag/artificial-intelligence/latest/rss', source: 'Wired' },
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica' },
  { url: 'https://huggingface.co/blog/feed.xml', source: 'Hugging Face' },
  { url: 'https://jack-clark.net/feed/', source: 'Import AI' },
  { url: 'https://bensbites.beehiiv.com/feed', source: "Ben's Bites" },
  { url: 'https://www.therundown.ai/rss', source: 'The Rundown AI' },
  { url: 'https://www.theneurondaily.com/rss', source: 'The Neuron' },
]

export async function fetchAINews(): Promise<AINewsItem[]> {
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

  const items: AINewsItem[] = []
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
    .slice(0, 30)
}
