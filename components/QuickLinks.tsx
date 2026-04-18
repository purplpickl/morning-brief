'use client'

import Image from 'next/image'

const LINKS = [
  { label: 'Todoist', appUrl: 'todoist://', webUrl: 'https://todoist.com/app', icon: 'https://www.google.com/s2/favicons?domain=todoist.com&sz=128' },
  { label: 'Gmail', appUrl: 'googlegmail://', webUrl: 'https://mail.google.com', icon: 'https://www.google.com/s2/favicons?domain=mail.google.com&sz=128' },
  { label: 'LinkedIn', appUrl: 'linkedin://', webUrl: 'https://www.linkedin.com/feed/', icon: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=128' },
  { label: 'Substack', appUrl: 'substack://', webUrl: 'https://substack.com/home', icon: 'https://www.google.com/s2/favicons?domain=substack.com&sz=128' },
  { label: 'Happy Scale', appUrl: 'happyscale://', webUrl: 'https://happyscale.com', icon: 'https://www.google.com/s2/favicons?domain=happyscale.com&sz=128' },
  { label: 'Copilot', appUrl: 'copilot://', webUrl: 'https://copilot.money', icon: 'https://www.google.com/s2/favicons?domain=copilot.money&sz=128' },
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
            className="bg-gray-900 rounded-xl py-4 flex flex-col items-center gap-2 hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Image
              src={link.icon}
              alt={link.label}
              width={40}
              height={40}
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
