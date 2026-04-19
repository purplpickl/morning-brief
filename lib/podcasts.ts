import Parser from 'rss-parser'

export interface PodcastEpisode {
  show: string
  title: string
  spotifyUrl: string
  pubDate: string
}

const parser = new Parser()

const PODCASTS: { show: string; rss: string; spotifyUrl: string }[] = [
  {
    show: 'AI Daily Brief',
    rss: 'https://feeds.megaphone.fm/AIDB',
    spotifyUrl: 'https://open.spotify.com/show/7gKwwMLFLc6RmjmRpbMtEO',
  },
  {
    show: 'Lex Fridman',
    rss: 'https://lexfridman.com/feed/podcast/',
    spotifyUrl: 'https://open.spotify.com/show/2MAi0BvDc6GTFvKFPXnkCL',
  },
  {
    show: 'Latent Space',
    rss: 'https://www.latent.space/feed/podcast',
    spotifyUrl: 'https://open.spotify.com/show/2L6WMqY3GUPCGBD0dX6p00',
  },
  {
    show: 'TBPN',
    rss: 'https://feeds.buzzsprout.com/2048087.rss',
    spotifyUrl: 'https://open.spotify.com/show/2p7zZVwVF6Yk0Zsb4QmT7t',
  },
]

export async function fetchPodcastEpisodes(): Promise<PodcastEpisode[]> {
  const results = await Promise.allSettled(
    PODCASTS.map(async ({ show, rss, spotifyUrl }) => {
      const feed = await parser.parseURL(rss)
      const latest = feed.items[0]
      if (!latest) throw new Error('no items')
      return {
        show,
        title: latest.title ?? '',
        spotifyUrl,
        pubDate: latest.pubDate ?? '',
      }
    })
  )

  return results
    .filter((r): r is PromiseFulfilledResult<PodcastEpisode> => r.status === 'fulfilled')
    .map(r => r.value)
}
