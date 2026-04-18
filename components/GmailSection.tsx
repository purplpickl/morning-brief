'use client'

import { GmailThread } from '@/lib/gmail'

function cleanFrom(from: string): string {
  return from.replace(/"([^"]+)"/, '$1').replace(/<.*>/, '').trim()
}

export default function GmailSection({ threads }: { threads: GmailThread[] }) {
  if (threads.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl px-4 py-4">
        <p className="text-gray-400 text-sm">No newsletters today yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {threads.map(thread => (
        <a
          key={thread.id}
          href={`https://mail.google.com/mail/u/0/#inbox/${thread.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-gray-900 rounded-xl px-4 py-3 hover:bg-gray-800 transition-colors"
        >
          <p className="text-white text-sm font-medium leading-snug">{thread.subject}</p>
          <p className="text-gray-400 text-xs mt-0.5">{cleanFrom(thread.from)}</p>
          {thread.snippet && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{thread.snippet}</p>
          )}
        </a>
      ))}
    </div>
  )
}
