'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

interface PostRatingProps {
  postId: string
}

function getOrCreateSessionId() {
  const key = 'ewa_sid'
  let sid = localStorage.getItem(key)
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem(key, sid)
  }
  return sid
}

export default function PostRating({ postId }: PostRatingProps) {
  const [submitting, setSubmitting] = useState(false)
  const [selected, setSelected] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [count, setCount] = useState(0)
  const [average, setAverage] = useState(0)
  const [message, setMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadSummary() {
      try {
        const response = await fetch(`/api/blog/ratings?post_id=${encodeURIComponent(postId)}`)
        if (!response.ok) return
        const data = (await response.json()) as { average?: number; count?: number }
        if (cancelled) return
        setAverage(Number(data.average ?? 0))
        setCount(Number(data.count ?? 0))
      } catch {
        // Ignore silently
      }
    }

    loadSummary()
    return () => {
      cancelled = true
    }
  }, [postId, refreshKey])

  async function submitRating(value: number) {
    if (submitting) return

    setSubmitting(true)
    setMessage('')
    try {
      const sessionId = getOrCreateSessionId()
      const response = await fetch('/api/blog/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          rating: value,
          session_id: sessionId,
          path: window.location.pathname,
        }),
      })

      if (!response.ok) {
        setMessage('Could not save rating')
        return
      }

      setSelected(value)
      setRefreshKey(key => key + 1)
      setMessage('Thanks for your rating')
    } catch {
      setMessage('Could not save rating')
    } finally {
      setSubmitting(false)
      setTimeout(() => setMessage(''), 2000)
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-900">Rate this article</p>
      <div className="mt-3 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map(value => {
          const active = (hovered || selected) >= value
          return (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => submitRating(value)}
              disabled={submitting}
              aria-label={`Rate ${value} out of 5`}
              className={`rounded-md p-1.5 transition-colors ${active ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
            >
              <Star className={`h-5 w-5 ${active ? 'fill-current' : ''}`} />
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-slate-600">
        {count > 0 ? `${average.toFixed(1)} / 5 from ${count} rating${count === 1 ? '' : 's'}` : 'No ratings yet'}
      </p>
      {message && <p className="mt-1 text-xs text-slate-500">{message}</p>}
    </div>
  )
}
