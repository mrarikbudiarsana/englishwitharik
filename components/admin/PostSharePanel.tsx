'use client'

import { useMemo, useState } from 'react'
import { Copy, ExternalLink } from 'lucide-react'

type ShareIntentChannel = 'linkedin' | 'facebook' | 'x'
type LinkChannel = ShareIntentChannel | 'instagram' | 'whatsapp' | 'youtube'

const linkChannelConfig: Record<LinkChannel, { label: string; source: string; medium: string }> = {
  linkedin: { label: 'LinkedIn', source: 'linkedin', medium: 'social' },
  facebook: { label: 'Facebook', source: 'facebook', medium: 'social' },
  x: { label: 'X', source: 'x', medium: 'social' },
  instagram: { label: 'Instagram', source: 'instagram', medium: 'social' },
  whatsapp: { label: 'WhatsApp', source: 'whatsapp', medium: 'referral' },
  youtube: { label: 'YouTube', source: 'youtube', medium: 'video' },
}

const shareIntentChannels: ShareIntentChannel[] = ['linkedin', 'facebook', 'x']

function normalizeBaseUrl(raw?: string): string {
  if (!raw) return 'https://englishwitharik.com'
  return raw.startsWith('http') ? raw : `https://${raw}`
}

function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function sanitizeCampaign(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function PostSharePanel({
  title,
  slug,
}: {
  title: string
  slug: string
}) {
  const siteBase = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL)
  const safeSlug = (slug || 'post-slug').trim() || 'post-slug'
  const postPath = `/blog/${safeSlug}`
  const plainPostUrl = `${siteBase}${postPath}`

  const [linkChannel, setLinkChannel] = useState<LinkChannel>('instagram')
  const [selectedIntents, setSelectedIntents] = useState<Set<ShareIntentChannel>>(
    new Set(['linkedin', 'facebook']),
  )
  const [campaign, setCampaign] = useState(`${monthKey()}-${safeSlug}`)

  const safeCampaign = useMemo(() => sanitizeCampaign(campaign) || `${monthKey()}-${safeSlug}`, [campaign, safeSlug])
  const linkMeta = linkChannelConfig[linkChannel]

  const trackedUrl = useMemo(() => {
    const params = new URLSearchParams({
      utm_source: linkMeta.source,
      utm_medium: linkMeta.medium,
      utm_campaign: safeCampaign,
    })
    return `${plainPostUrl}?${params.toString()}`
  }, [plainPostUrl, linkMeta.source, linkMeta.medium, safeCampaign])

  const shareText = `${title || 'New blog post'}\n\n${trackedUrl}`

  function toggleIntentChannel(channel: ShareIntentChannel) {
    setSelectedIntents(prev => {
      const next = new Set(prev)
      if (next.has(channel)) next.delete(channel)
      else next.add(channel)
      return next
    })
  }

  async function copyText(value: string, successLabel: string) {
    try {
      await navigator.clipboard.writeText(value)
      window.alert(`${successLabel} copied.`)
    } catch {
      window.alert('Clipboard access failed. Please copy manually.')
    }
  }

  function shareIntentUrl(channel: ShareIntentChannel): string {
    if (channel === 'linkedin') {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(trackedUrl)}`
    }
    if (channel === 'facebook') {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(trackedUrl)}`
    }
    return `https://twitter.com/intent/tweet?url=${encodeURIComponent(trackedUrl)}&text=${encodeURIComponent(title || 'New blog post')}`
  }

  function openSelectedIntents() {
    if (selectedIntents.size === 0) {
      window.alert('Select at least one social channel first.')
      return
    }
    for (const channel of selectedIntents) {
      window.open(shareIntentUrl(channel), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Share Assist</h3>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Campaign Name</label>
          <input
            type="text"
            value={campaign}
            onChange={e => setCampaign(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          />
          <p className="text-xs text-gray-400 mt-1">Use lowercase and hyphens. Example: 2026-02-business-english-reel</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">UTM Channel</label>
          <select
            value={linkChannel}
            onChange={e => setLinkChannel(e.target.value as LinkChannel)}
            className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          >
            {Object.entries(linkChannelConfig).map(([value, cfg]) => (
              <option key={value} value={value}>{cfg.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Tracked Share Link</label>
          <code className="block text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2 break-all">
            {trackedUrl}
          </code>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => copyText(trackedUrl, 'Tracked link')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Copy size={13} /> Copy Link
            </button>
            <a
              href={trackedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              <ExternalLink size={13} /> Open Link
            </a>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Channels To Open</label>
          <div className="flex flex-wrap gap-2">
            {shareIntentChannels.map(channel => {
              const active = selectedIntents.has(channel)
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleIntentChannel(channel)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-[#08507f] text-white border-[#08507f]'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {linkChannelConfig[channel].label}
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={openSelectedIntents}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#08507f] text-white rounded-lg hover:bg-[#063a5c]"
            >
              <ExternalLink size={13} /> Open Selected
            </button>
            <button
              type="button"
              onClick={() => copyText(shareText, 'Share text')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Copy size={13} /> Copy Caption + Link
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Instagram does not support direct web share intent. Use Copy Caption + Link for manual posting.
      </p>
    </div>
  )
}
