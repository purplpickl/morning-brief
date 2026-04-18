'use client'

import { useEffect, useState, useCallback } from 'react'
import { NewsItem } from '@/lib/wsj'

const STORAGE_KEY = 'morning-brief-feedback'
type Feedback = Record<string, 'up' | 'down'>

function loadFeedback(): Feedback {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}
function saveFeedback(f: Feedback) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(f))
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
      <span
        className="shrink-0 font-label text-[9px] font-bold px-1 py-0.5 leading-none"
        style={{ background: '#FFF1E5', color: '#990F3D' }}
      >
        FT
      </span>
    )
  }
  return (
    <span
      className="shrink-0 font-label text-[9px] font-bold px-1 py-0.5 leading-none"
      style={{ border: '1px solid rgba(236,228,211,0.5)', color: '#ece4d3' }}
    >
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
    <div className="flex gap-2 mt-1.5">
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onVote(url, current === 'up' ? null : 'up') }}
        className={`text-xs leading-none transition-opacity ${current === 'up' ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}
      >👍</button>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); onVote(url, current === 'down' ? null : 'down') }}
        className={`text-xs leading-none transition-opacity ${current === 'down' ? 'opacity-100' : 'opacity-20 hover:opacity-50'}`}
      >👎</button>
    </div>
  )
}

export default function NewsSection({ items }: { items: NewsItem[] }) {
  const [feedback, setFeedback] = useState<Feedback>({})

  useEffect(() => { setFeedback(loadFeedback()) }, [])

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
    const fa = feedback[a.link], fb = feedback[b.link]
    if (fa === 'up' && fb !== 'up') return -1
    if (fb === 'up' && fa !== 'up') return 1
    return 0
  })

  if (sorted.length === 0) return null

  const [lead, ...rest] = sorted

  return (
    <div>
      {/* Lead article */}
      <div
        className="pb-5 mb-5"
        style={{
          borderBottom: '1px solid rgba(236,228,211,0.35)',
          opacity: feedback[lead.link] === 'down' ? 0.4 : 1,
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <a href={lead.link} target="_blank" rel="noopener noreferrer" className="group">
            <h2
              className="font-editorial font-bold text-ink leading-tight group-hover:underline"
              style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
            >
              {lead.title}
            </h2>
          </a>
          <SourceBadge source={lead.source} />
        </div>
        {lead.contentSnippet && (
          <p className="font-body-serif text-muted text-base leading-relaxed max-w-3xl mb-2">
            {lead.contentSnippet}
          </p>
        )}
        <div className="flex items-center gap-3">
          <span className="font-label text-[10px] text-muted/70">{timeAgo(lead.pubDate)}</span>
          <ThumbButtons url={lead.link} feedback={feedback} onVote={handleVote} />
        </div>
      </div>

      {/* Secondary articles — 3-col grid */}
      {rest.length > 0 && (
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)', columnGap: '28px' }}
        >
          {rest.map((item, i) => (
            <div
              key={i}
              className="py-3"
              style={{
                borderBottom: '1px dotted rgba(236,228,211,0.25)',
                borderRight: (i + 1) % 3 !== 0 ? '1px dotted rgba(236,228,211,0.25)' : 'none',
                paddingRight: (i + 1) % 3 !== 0 ? '28px' : '0',
                opacity: feedback[item.link] === 'down' ? 0.4 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="group">
                  <h3 className="font-editorial font-semibold text-ink text-[15px] leading-snug group-hover:underline">
                    {item.title}
                  </h3>
                </a>
                <SourceBadge source={item.source} />
              </div>
              {item.contentSnippet && (
                <p className="text-muted text-xs leading-relaxed line-clamp-3 mb-1.5">
                  {item.contentSnippet}
                </p>
              )}
              <div className="flex items-center gap-3">
                <span className="font-label text-[10px] text-muted/60">{timeAgo(item.pubDate)}</span>
                <ThumbButtons url={item.link} feedback={feedback} onVote={handleVote} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
