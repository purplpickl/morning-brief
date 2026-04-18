import { SportsItem } from '@/lib/sports'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}

export default function SportsSection({ items }: { items: SportsItem[] }) {
  if (items.length === 0) return null
  return (
    <div>
      {items.map((item, i) => (
        <a
          key={i}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block py-3 group"
          style={{ borderBottom: '1px dotted rgba(236,228,211,0.25)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-editorial text-[14px] font-semibold text-ink leading-snug group-hover:underline">
              {item.title}
            </h4>
            {item.source && (
              <span
                className="shrink-0 font-label text-[9px] text-muted mt-0.5"
                style={{ border: '1px solid rgba(148,138,121,0.4)', padding: '1px 4px' }}
              >
                {item.source}
              </span>
            )}
          </div>
          {item.contentSnippet && (
            <p className="text-muted text-xs leading-relaxed line-clamp-2 mt-1">
              {item.contentSnippet}
            </p>
          )}
          <span className="font-label text-[10px] text-muted/60 mt-1 block">
            {timeAgo(item.pubDate)}
          </span>
        </a>
      ))}
    </div>
  )
}
