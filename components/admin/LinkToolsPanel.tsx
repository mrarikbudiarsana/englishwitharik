'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import CopyToClipboardButton from '@/components/admin/CopyToClipboardButton'

function buildUrlWithUtm(destination: string, source: string, medium: string, campaign: string) {
  try {
    const url = new URL(destination)
    if (source.trim()) url.searchParams.set('utm_source', source.trim())
    if (medium.trim()) url.searchParams.set('utm_medium', medium.trim())
    if (campaign.trim()) url.searchParams.set('utm_campaign', campaign.trim())
    return url.toString()
  } catch {
    return destination
  }
}

export default function LinkToolsPanel() {
  const [destination, setDestination] = useState('https://englishwitharik.com/id/kursus-business-english-indonesia')
  const [source, setSource] = useState('instagram')
  const [medium, setMedium] = useState('social')
  const [campaign, setCampaign] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [isGeneratingShortUrl, setIsGeneratingShortUrl] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const longUrl = useMemo(() => buildUrlWithUtm(destination, source, medium, campaign), [campaign, destination, medium, source])
  const qrTargetUrl = shortUrl || longUrl
  const qrImageUrl = useMemo(() => {
    if (!qrTargetUrl.trim()) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrTargetUrl)}`
  }, [qrTargetUrl])

  async function handleGenerateShortUrl() {
    setIsGeneratingShortUrl(true)
    setErrorMessage('')
    setShortUrl('')

    try {
      const response = await fetch('/api/admin/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl }),
      })

      const data = await response.json() as { shortUrl?: string; error?: string }
      if (!response.ok || !data.shortUrl) {
        setErrorMessage(data.error ?? 'Failed to generate short URL.')
        return
      }

      setShortUrl(data.shortUrl)
    } catch {
      setErrorMessage('Failed to generate short URL.')
    } finally {
      setIsGeneratingShortUrl(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900">Link Shortener + QR Generator</h2>
      <p className="text-sm text-gray-500 mt-1">Create a trackable link, shorten it, and generate a QR code for sharing.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
        <div className="space-y-4">
          <div>
            <label htmlFor="destination-url" className="block text-xs font-medium text-gray-600 mb-1">Destination URL</label>
            <input
              id="destination-url"
              type="url"
              value={destination}
              onChange={event => setDestination(event.target.value)}
              placeholder="https://englishwitharik.com/..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#08507f]/25 focus:border-[#08507f]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="utm-source" className="block text-xs font-medium text-gray-600 mb-1">UTM Source</label>
              <input
                id="utm-source"
                type="text"
                value={source}
                onChange={event => setSource(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#08507f]/25 focus:border-[#08507f]"
              />
            </div>
            <div>
              <label htmlFor="utm-medium" className="block text-xs font-medium text-gray-600 mb-1">UTM Medium</label>
              <input
                id="utm-medium"
                type="text"
                value={medium}
                onChange={event => setMedium(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#08507f]/25 focus:border-[#08507f]"
              />
            </div>
            <div>
              <label htmlFor="utm-campaign" className="block text-xs font-medium text-gray-600 mb-1">UTM Campaign</label>
              <input
                id="utm-campaign"
                type="text"
                value={campaign}
                onChange={event => setCampaign(event.target.value)}
                placeholder="march-promo"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#08507f]/25 focus:border-[#08507f]"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-600 mb-1">Generated Long URL</p>
            <code className="text-xs text-gray-700 break-all">{longUrl}</code>
            <div className="mt-2">
              <CopyToClipboardButton value={longUrl} label="Copy long URL" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateShortUrl}
              disabled={isGeneratingShortUrl || !longUrl.trim()}
              className="inline-flex items-center rounded-md bg-[#08507f] px-4 py-2 text-sm font-medium text-white hover:bg-[#063a5c] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingShortUrl ? 'Generating...' : 'Generate short URL'}
            </button>
            {shortUrl ? <CopyToClipboardButton value={shortUrl} label="Copy short URL" /> : null}
          </div>

          {shortUrl ? (
            <p className="text-sm text-gray-700 break-all"><span className="font-medium">Short URL:</span> {shortUrl}</p>
          ) : null}
          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-800">QR Code</p>
          <p className="text-xs text-gray-500 mt-1">QR uses {shortUrl ? 'short URL' : 'long URL'}.</p>
          {qrImageUrl ? (
            <div className="mt-3">
              <Image src={qrImageUrl} alt="Generated QR code" width={224} height={224} className="rounded-lg border border-gray-200 bg-white" />
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={qrImageUrl}
                  download="englishwitharik-qr.png"
                  className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Download QR
                </a>
                <CopyToClipboardButton value={qrTargetUrl} label="Copy QR target URL" />
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-3">Enter a valid URL to generate a QR code.</p>
          )}
        </div>
      </div>
    </div>
  )
}
