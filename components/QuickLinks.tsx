'use client'

const LINKS = [
  { label: 'Todoist', href: 'https://todoist.com/app', emoji: '✅' },
  { label: 'Gmail', href: 'https://mail.google.com', emoji: '📧' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/feed/', emoji: '💼' },
]

export default function QuickLinks() {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
        Quick Links
      </h2>
      <div className="flex gap-3">
        {LINKS.map(link => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-900 rounded-xl py-3 flex flex-col items-center gap-1 hover:bg-gray-800 transition-colors"
          >
            <span className="text-2xl">{link.emoji}</span>
            <span className="text-xs text-gray-300 font-medium">{link.label}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
