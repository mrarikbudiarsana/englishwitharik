'use client'

import { useEffect, useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'

const SITE_BASE = 'https://www.englishwitharik.com'

const CHANNELS = [
    { key: 'instagram', label: 'Instagram', source: 'instagram', medium: 'social' },
    { key: 'linkedin', label: 'LinkedIn', source: 'linkedin', medium: 'social' },
    { key: 'facebook', label: 'Facebook', source: 'facebook', medium: 'social' },
    { key: 'x', label: 'X', source: 'x', medium: 'social' },
    { key: 'threads', label: 'Threads', source: 'threads', medium: 'social' },
    { key: 'whatsapp', label: 'WhatsApp', source: 'whatsapp', medium: 'referral' },
    { key: 'youtube', label: 'YouTube', source: 'youtube', medium: 'video' },
] as const

function monthKey() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function buildUrl(slug: string, source: string, medium: string) {
    const campaign = `${monthKey()}-${slug}`
    const params = new URLSearchParams({ utm_source: source, utm_medium: medium, utm_campaign: campaign })
    return `${SITE_BASE}/blog/${slug}?${params.toString()}`
}

export default function SharePostButton({ slug }: { slug: string }) {
    const [open, setOpen] = useState(false)
    const [copiedKey, setCopiedKey] = useState<string | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    async function copy(key: string, url: string) {
        try {
            await navigator.clipboard.writeText(url)
            setCopiedKey(key)
            setTimeout(() => setCopiedKey(null), 1800)
        } catch {
            window.alert('Clipboard access failed.')
        }
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy tracked share links"
            >
                Share
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-72">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Copy tracked link for…</p>
                    <div className="space-y-1">
                        {CHANNELS.map(ch => {
                            const url = buildUrl(slug, ch.source, ch.medium)
                            const isCopied = copiedKey === ch.key
                            return (
                                <div key={ch.key} className="flex items-center justify-between gap-2 py-1">
                                    <span className="text-xs text-gray-700 w-16 flex-shrink-0">{ch.label}</span>
                                    <code className="text-[10px] text-gray-400 truncate flex-1 min-w-0">{url}</code>
                                    <button
                                        type="button"
                                        onClick={() => copy(ch.key, url)}
                                        className="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                                        title={`Copy ${ch.label} link`}
                                    >
                                        {isCopied
                                            ? <Check size={12} className="text-green-600" />
                                            : <Copy size={12} className="text-gray-400" />
                                        }
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
