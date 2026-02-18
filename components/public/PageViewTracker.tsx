'use client'

import { useEffect } from 'react'

function getOrCreateSessionId(): string {
  const key = 'ewa_sid'
  let sid = localStorage.getItem(key)
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem(key, sid)
  }
  return sid
}

export default function PageViewTracker({ path, postId }: { path: string; postId?: string }) {
  useEffect(() => {
    const session_id = getOrCreateSessionId()
    fetch('/api/blog/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, post_id: postId, session_id }),
    }).catch(() => {}) // fire and forget
  }, [path, postId])

  return null
}
