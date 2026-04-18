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
  if (items.length === 0) return null

  const [lead, ...rest] = items

  return (
    <div>
      {/* Lead article */}
      <div className="pb-5 mb-5" style={{ borderBottom: '1px solid rgba(236,228,211,0.35)' }}>
        <a href={lead.link} target="_blank" rel="noopener noreferrer" className="group">
          <h2
            className="font-editorial font-bold text-ink leading-tight group-hover:underline mb-2"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
          >
            {lead.title}
          </h2>
        </a>
        {lead.contentSnippet && (
          <p className="font-body-serif text-muted text-base leading-relaxed max-w-3xl mb-2">
            {lead.contentSnippet}
          </p>
        )}
        <span className="font-label text-[10px] text-muted/70">{timeAgo(lead.pubDate)}</span>
      </div>

      {/* Secondary articles */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-x-7">
          {rest.map((item, i) => (
            <div
              key={i}
              className="py-3"
              style={{ borderBottom: '1px dotted rgba(236,228,211,0.25)' }}
            >
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="group">
                <h3 className="font-editorial font-semibold text-ink text-[15px] leading-snug group-hover:underline mb-1">
                  {item.title}
                </h3>
              </a>
              {item.contentSnippet && (
                <p className="text-muted text-xs leading-relaxed line-clamp-3 mb-1.5">
                  {item.contentSnippet}
                </p>
              )}
              <span className="font-label text-[10px] text-muted/60">{timeAgo(item.pubDate)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
