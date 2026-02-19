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
    setIsSaved(savedPosts.some(post => post.url === normalizedUrl))
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
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-500">Share this:</span>
      <button
        type="button"
        onClick={() => openNetworkShare('whatsapp')}
        className="px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-[#08507f] transition-colors text-xs font-semibold"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        WA
      </button>
      <button
        type="button"
        onClick={() => openNetworkShare('x')}
        className="px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-[#08507f] transition-colors text-xs font-semibold"
        title="Share on X"
        aria-label="Share on X"
      >
        X
      </button>
      <button
        type="button"
        onClick={() => openNetworkShare('facebook')}
        className="px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-[#08507f] transition-colors text-xs font-semibold"
        title="Share on Facebook"
        aria-label="Share on Facebook"
      >
        FB
      </button>
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
        className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-[#08507f] transition-colors"
        title={isSaved ? 'Remove from saved posts' : 'Save for later'}
        aria-label={isSaved ? 'Remove from saved posts' : 'Save for later'}
      >
        {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
      </button>
      <span className="text-xs text-slate-500 min-w-12">{statusText}</span>
    </div>
  )
}
