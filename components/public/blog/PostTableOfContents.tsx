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
    <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-auto">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">On this page</h2>
      <nav aria-label="Table of contents">
        <ul className="space-y-3 relative border-l border-slate-200">
          {validHeadings.map(heading => (
            <li key={heading.id} className="relative pl-4">
              <div
                className={`absolute left-[-1px] top-1.5 h-full w-[2px] transition-colors duration-300 ${activeId === heading.id ? 'bg-[#08507f] h-[1em]' : 'bg-transparent'
                  }`}
                style={{ height: 'calc(1em + 4px)', top: '2px' }}
              />
              <a
                href={`#${heading.id}`}
                aria-current={activeId === heading.id ? 'location' : undefined}
                className={`block text-sm leading-relaxed transition-colors ${activeId === heading.id
                    ? 'font-semibold text-[#08507f]'
                    : 'text-slate-500 hover:text-slate-800'
                  } ${heading.level === 3 ? 'ml-3' : ''}`}
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
