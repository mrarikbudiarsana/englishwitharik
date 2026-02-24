'use client'

import { useState } from 'react'

export default function SharePostButton({ slug }: { slug: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        const url = `https://www.englishwitharik.com/blog/${slug}`
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
        } catch {
            // Fallback: open in new tab so user can copy manually
            window.open(url, '_blank')
        }
    }

    return (
        <button
            onClick={handleCopy}
            className={`text-xs transition-colors ${copied ? 'text-green-600 font-medium' : 'text-gray-400 hover:text-gray-600'}`}
            title="Copy public URL to clipboard"
        >
            {copied ? 'Copied!' : 'Share'}
        </button>
    )
}
