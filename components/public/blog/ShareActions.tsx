'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bookmark, BookmarkCheck, Link2 } from 'lucide-react'

interface ShareActionsProps {
  postUrl: string
  title: string
}

interface SavedPost {
  url: string
  title: string
  savedAt: string
}

const STORAGE_KEY = 'ewa_saved_posts'

function readSavedPosts(): SavedPost[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSavedPosts(posts: SavedPost[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

export default function ShareActions({ postUrl, title }: ShareActionsProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [statusText, setStatusText] = useState<string>('')

  const normalizedUrl = useMemo(() => postUrl.trim(), [postUrl])

  useEffect(() => {
    const savedPosts = readSavedPosts()
    const isUrlSaved = savedPosts.some(post => post.url === normalizedUrl)
    setTimeout(() => setIsSaved(isUrlSaved), 0)
  }, [normalizedUrl])

  function openNetworkShare(network: 'whatsapp' | 'x' | 'facebook') {
    const encodedUrl = encodeURIComponent(normalizedUrl)
    const encodedTitle = encodeURIComponent(title)
    let target = ''

    if (network === 'whatsapp') {
      target = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    } else if (network === 'x') {
      target = `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    } else {
      target = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    }

    window.open(target, '_blank', 'noopener,noreferrer')
  }

  async function handleCopyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(normalizedUrl)
        setStatusText('Link copied')
        setTimeout(() => setStatusText(''), 1800)
        return
      }

      setStatusText('Copy unavailable')
      setTimeout(() => setStatusText(''), 1800)
    } catch {
      setStatusText('Copy failed')
      setTimeout(() => setStatusText(''), 1800)
    }
  }

  function handleSaveToggle() {
    const savedPosts = readSavedPosts()

    if (isSaved) {
      const next = savedPosts.filter(post => post.url !== normalizedUrl)
      writeSavedPosts(next)
      setIsSaved(false)
      setStatusText('Removed')
      setTimeout(() => setStatusText(''), 1800)
      return
    }

    const next: SavedPost[] = [
      ...savedPosts,
      {
        url: normalizedUrl,
        title,
        savedAt: new Date().toISOString(),
      },
    ]
    writeSavedPosts(next)
    setIsSaved(true)
    setStatusText('Saved')
    setTimeout(() => setStatusText(''), 1800)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-500 mr-2">Share this:</span>
      <button
        type="button"
        onClick={() => openNetworkShare('whatsapp')}
        className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-[#25D366] transition-colors"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => openNetworkShare('x')}
        className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-black transition-colors"
        title="Share on X"
        aria-label="Share on X"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
          <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => openNetworkShare('facebook')}
        className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-[#1877F2] transition-colors"
        title="Share on Facebook"
        aria-label="Share on Facebook"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      </button>
      <div className="w-px h-6 bg-slate-200 mx-1"></div>
      <button
        type="button"
        onClick={handleCopyLink}
        className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-[#08507f] transition-colors"
        title="Copy link"
        aria-label="Copy link"
      >
        <Link2 className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={handleSaveToggle}
        className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-[#08507f] transition-colors relative"
        title={isSaved ? 'Remove from saved posts' : 'Save for later'}
        aria-label={isSaved ? 'Remove from saved posts' : 'Save for later'}
      >
        {isSaved ? <BookmarkCheck className="w-5 h-5 text-[#08507f]" /> : <Bookmark className="w-5 h-5" />}
      </button>
      <span className="text-xs text-slate-500 min-w-[80px] text-right">{statusText}</span>
    </div>
  )
}
