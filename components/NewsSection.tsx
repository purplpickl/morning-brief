'use client'

import { NewsItem } from '@/lib/wsj'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}

export default function NewsSection({ items }: { items: NewsItem[] }) {
  return (
    <div className="space-y-2">
        {items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors"
          >
            <p className="text-white text-sm font-medium leading-snug">{item.title}</p>
            {item.contentSnippet && (
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.contentSnippet}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">{timeAgo(item.pubDate)}</p>
          </a>
        ))}
    </div>
  )
}
