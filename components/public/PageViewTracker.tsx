'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getAttributionBundle } from '@/lib/attribution'

function getOrCreateSessionId(): string {
  const key = 'ewa_sid'
  let sid = typeof window !== 'undefined' ? localStorage.getItem(key) : null
  if (!sid && typeof window !== 'undefined') {
    sid = crypto.randomUUID()
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
