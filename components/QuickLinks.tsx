'use client'

import Image from 'next/image'

const LINKS = [
  { label: 'Todoist', appUrl: 'todoist://', webUrl: 'https://todoist.com/app', icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://todoist.com&size=256' },
  { label: 'Gmail', appUrl: 'googlegmail://', webUrl: 'https://mail.google.com', icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://mail.google.com&size=256' },
  { label: 'LinkedIn', appUrl: 'linkedin://', webUrl: 'https://www.linkedin.com/feed/', icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://linkedin.com&size=256' },
  { label: 'Substack', appUrl: 'substack://', webUrl: 'https://substack.com/home', icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://substack.com&size=256' },
  { label: 'Happy Scale', appUrl: 'happyscale://', webUrl: 'https://happyscale.com', icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://happyscale.com&size=256' },
  { label: 'Copilot', appUrl: 'copilot://', webUrl: 'https://copilot.money', icon: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://copilot.money&size=256' },
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
            className="bg-gray-900 rounded-xl py-3 flex flex-col items-center gap-2 hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Image
              src={link.icon}
              alt={link.label}
              width={56}
              height={56}
              className="rounded-xl"
              unoptimized
            />
            <span className="text-xs text-gray-300 font-medium">{link.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
