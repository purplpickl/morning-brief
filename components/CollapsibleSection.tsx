'use client'

import { useState } from 'react'

export default function CollapsibleSection({
  title,
  children,
  badge,
}: {
  title: string
  children: React.ReactNode
  badge?: string | number
}) {
  const [open, setOpen] = useState(false)

  return (
    <section>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-2 group"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 group-hover:text-gray-300 transition-colors">
            {title}
          </h2>
          {badge !== undefined && (
            <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-md">{badge}</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && <div className="mt-1">{children}</div>}
    </section>
  )
}
