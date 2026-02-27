'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getAttributionBundle } from '@/lib/attribution'

function getOrCreateSessionId(): string {
  const key = 'ewa_sid'
  let sid = typeof window !== 'undefined' ? localStorage.getItem(key) : null
  if (!sid && typeof window !== 'undefined') {
    const webCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
    if (webCrypto?.randomUUID) {
      sid = webCrypto.randomUUID()
    } else if (webCrypto?.getRandomValues) {
      const bytes = new Uint8Array(16)
      webCrypto.getRandomValues(bytes)
      bytes[6] = (bytes[6] & 0x0f) | 0x40
      bytes[8] = (bytes[8] & 0x3f) | 0x80
      sid = [...bytes].map((b, i) => {
        const hex = b.toString(16).padStart(2, '0')
        return [4, 6, 8, 10].includes(i) ? `-${hex}` : hex
      }).join('')
    } else {
      sid = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    }
    localStorage.setItem(key, sid)
  }
  return sid || ''
}

export default function PageViewTracker({ path: propsPath, postId }: { path?: string; postId?: string }) {
  const pathname = usePathname()
  const path = propsPath || pathname

  useEffect(() => {
    if (!path) return

    // Skip global (prop-less) tracking on blog pages to avoid double-counting.
    // The blog page has its own PageViewTracker with a postId.
    if (!propsPath && pathname.startsWith('/blog/')) return

    const session_id = getOrCreateSessionId()
    const attribution = getAttributionBundle()
    const referrer = typeof document !== 'undefined' ? document.referrer || null : null
    fetch('/api/blog/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        post_id: postId,
        session_id,
        referrer,
        ...attribution.first,
        first_seen_attribution: attribution.first,
        last_seen_attribution: attribution.last,
      }),
    }).catch(() => { }) // fire and forget
  }, [path, postId, propsPath, pathname])

  return null
}
