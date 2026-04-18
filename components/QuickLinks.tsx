'use client'

const LINKS = [
  { label: 'Todoist', appUrl: 'todoist://', webUrl: 'https://todoist.com/app', emoji: '✅' },
  { label: 'Gmail', appUrl: 'googlegmail://', webUrl: 'https://mail.google.com', emoji: '📧' },
  { label: 'LinkedIn', appUrl: 'linkedin://', webUrl: 'https://www.linkedin.com/feed/', emoji: '💼' },
  { label: 'Substack', appUrl: 'substack://', webUrl: 'https://substack.com/home', emoji: '📰' },
  { label: 'Happy Scale', appUrl: 'happyscale://', webUrl: 'https://happyscale.com', emoji: '⚖️' },
  { label: 'Copilot', appUrl: 'copilot://', webUrl: 'https://copilot.money', emoji: '💰' },
]

function openApp(appUrl: string, webUrl: string) {
  const start = Date.now()
  const timeout = setTimeout(() => {
    if (Date.now() - start < 1500) window.location.href = webUrl
  }, 1000)
  window.location.href = appUrl
  window.addEventListener('blur', () => clearTimeout(timeout), { once: true })
}

export default function QuickLinks() {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
        Quick Links
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {LINKS.map(link => (
          <button
            key={link.label}
            onClick={() => openApp(link.appUrl, link.webUrl)}
            className="flex-1 bg-gray-900 rounded-xl py-3 flex flex-col items-center gap-1 hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <span className="text-2xl">{link.emoji}</span>
            <span className="text-xs text-gray-300 font-medium">{link.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
