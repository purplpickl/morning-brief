import { GmailThread } from '@/lib/gmail'

function cleanFrom(from: string): string {
  return from.replace(/"([^"]+)"/, '$1').replace(/<.*>/, '').trim()
}

export default function GmailSection({ threads }: { threads: GmailThread[] }) {
  if (threads.length === 0) {
    return <p className="font-label text-xs text-muted italic">No newsletters today yet.</p>
  }

  return (
    <div className="grid gap-x-8" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
      {threads.map(thread => (
        <a
          key={thread.id}
          href={`https://mail.google.com/mail/u/0/#inbox/${thread.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block py-3 group"
          style={{ borderBottom: '1px dotted rgba(236,228,211,0.25)' }}
        >
          <h4 className="font-editorial text-[14px] font-semibold text-ink leading-snug group-hover:underline">
            {thread.subject}
          </h4>
          <p className="font-label text-[10px] text-muted mt-0.5">{cleanFrom(thread.from)}</p>
          {thread.snippet && (
            <p className="text-muted text-xs leading-relaxed line-clamp-2 mt-1">{thread.snippet}</p>
          )}
        </a>
      ))}
    </div>
  )
}
