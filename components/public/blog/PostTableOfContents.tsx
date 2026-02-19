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
    <aside className="mb-8 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 lg:sticky lg:top-24">
      <h2 className="text-sm font-semibold text-slate-800 mb-3">Table of Contents</h2>
      <nav aria-label="Table of contents">
        <ul className="space-y-2">
          {validHeadings.map(heading => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`block text-sm transition-colors ${heading.level === 3 ? 'pl-4' : ''} ${activeId === heading.id
                  ? 'text-[#08507f] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
