'use client'

import { useEffect, useMemo, useState } from 'react'

interface TocHeading {
  id: string
  text: string
  level: 2 | 3
}

interface PostTableOfContentsProps {
  headings: TocHeading[]
}

export default function PostTableOfContents({ headings }: PostTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '')

  const validHeadings = useMemo(
    () => headings.filter(h => h.id && h.text.trim().length > 0),
    [headings]
  )

  useEffect(() => {
    if (!validHeadings.length) return

    function updateActiveHeading() {
      let nextActive = validHeadings[0].id
      for (const heading of validHeadings) {
        const el = document.getElementById(heading.id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= 140) nextActive = heading.id
      }
      setActiveId(nextActive)
    }

    updateActiveHeading()
    window.addEventListener('scroll', updateActiveHeading, { passive: true })
    window.addEventListener('resize', updateActiveHeading)
    return () => {
      window.removeEventListener('scroll', updateActiveHeading)
      window.removeEventListener('resize', updateActiveHeading)
    }
  }, [validHeadings])

  if (!validHeadings.length) return null

  return (
    <aside className="hidden md:block md:sticky md:top-24 md:self-start md:z-20 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-[0_8px_24px_-12px_rgba(2,6,23,0.35)] backdrop-blur">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Table of Contents</h2>
      <nav aria-label="Table of contents" className="max-h-[calc(100vh-8rem)] overflow-auto pr-1">
        <ul className="space-y-1">
          {validHeadings.map(heading => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={activeId === heading.id ? 'location' : undefined}
                className={`group relative block rounded-lg py-1.5 text-[13px] leading-6 transition-all ${heading.level === 3 ? 'pl-8 pr-2' : 'pl-3 pr-2'} ${activeId === heading.id
                  ? 'bg-[#08507f]/12 font-semibold text-[#08507f] ring-1 ring-[#08507f]/25'
                  : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
                  }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full transition-all ${activeId === heading.id
                    ? 'w-1.5 bg-[#08507f]'
                    : 'w-0 bg-transparent group-hover:w-1 group-hover:bg-slate-300'
                    }`}
                />
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
