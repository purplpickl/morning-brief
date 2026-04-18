'use client'

import { GmailThread } from '@/lib/gmail'

function cleanFrom(from: string): string {
  return from.replace(/"([^"]+)"/, '$1').replace(/<.*>/, '').trim()
}

export default function GmailSection({ threads }: { threads: GmailThread[] }) {
  if (threads.length === 0) {
    return (
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Daily Reads
        </h2>
        <div className="bg-gray-900 rounded-xl px-4 py-4">
          <p className="text-gray-400 text-sm">No newsletters today yet, or Gmail not connected.</p>
          <p className="text-gray-500 text-xs mt-1">Add GOOGLE_REFRESH_TOKEN to connect Gmail.</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
        Daily Reads
      </h2>
      <div className="space-y-2">
        {threads.map(thread => (
          <a
            key={thread.id}
            href={`https://mail.google.com/mail/u/0/#inbox/${thread.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-white text-sm font-medium leading-snug">{thread.subject}</p>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">{cleanFrom(thread.from)}</p>
            {thread.snippet && (
              <p className="text-gray-500 text-xs mt-1 line-clamp-2">{thread.snippet}</p>
            )}
          </a>
        ))}
      </div>
    </section>
  )
}
