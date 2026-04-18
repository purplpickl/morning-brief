'use client'

import { useEffect, useState, useCallback } from 'react'
import { NewsItem } from '@/lib/wsj'

const STORAGE_KEY = 'morning-brief-feedback'

type Feedback = Record<string, 'up' | 'down'>

function loadFeedback(): Feedback {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveFeedback(feedback: Feedback) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feedback))
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}

function SourceBadge({ source }: { source: 'FT' | 'WSJ' }) {
  if (source === 'FT') {
    return (
      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFF1E5] text-[#990F3D] leading-none">
        FT
      </span>
    )
  }
  return (
    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0274B6] text-white leading-none">
      WSJ
    </span>
  )
}

function ThumbButtons({
  url,
  feedback,
  onVote,
}: {
  url: string
  feedback: Feedback
  onVote: (url: string, vote: 'up' | 'down' | null) => void
}) {
  const current = feedback[url]

  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onVote(url, current === 'up' ? null : 'up') }}
        className={`text-sm leading-none transition-opacity ${current === 'up' ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
        aria-label="Thumbs up"
      >
        👍
      </button>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onVote(url, current === 'down' ? null : 'down') }}
        className={`text-sm leading-none transition-opacity ${current === 'down' ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
        aria-label="Thumbs down"
      >
        👎
      </button>
    </div>
  )
}

export default function NewsSection({ items }: { items: NewsItem[] }) {
  const [feedback, setFeedback] = useState<Feedback>({})

  useEffect(() => {
    setFeedback(loadFeedback())
  }, [])

  const handleVote = useCallback((url: string, vote: 'up' | 'down' | null) => {
    setFeedback(prev => {
      const next = { ...prev }
      if (vote === null) delete next[url]
      else next[url] = vote
      saveFeedback(next)
      return next
    })
  }, [])

  const sorted = [...items].sort((a, b) => {
    const fa = feedback[a.link]
    const fb = feedback[b.link]
    if (fa === 'up' && fb !== 'up') return -1
    if (fb === 'up' && fa !== 'up') return 1
    return 0
  })

  return (
    <div className="space-y-2">
      {sorted.map((item, i) => {
        const isDown = feedback[item.link] === 'down'
        return (
          <div key={i} className={`transition-opacity ${isDown ? 'opacity-40' : 'opacity-100'}`}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-white text-sm font-medium leading-snug">{item.title}</p>
                <SourceBadge source={item.source} />
              </div>
              {item.contentSnippet && (
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.contentSnippet}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">{timeAgo(item.pubDate)}</p>
            </a>
            <div className="px-4">
              <ThumbButtons url={item.link} feedback={feedback} onVote={handleVote} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
