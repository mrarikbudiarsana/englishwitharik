'use client'

import { useMemo, useState } from 'react'
import { getAttributionBundle } from '@/lib/attribution'

export interface CtaConfig {
  title: string
  description?: string
  submitLabel?: string
  successMessage?: string
  source?: string
  blockId?: string
  collectName?: boolean
  collectEmail?: boolean
  collectWhatsapp?: boolean
}

interface CtaBlockProps {
  config: CtaConfig
  postId?: string
  postSlug?: string
}

export default function CtaBlock({ config, postId, postSlug }: CtaBlockProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const collectName = config.collectName ?? true
  const collectEmail = config.collectEmail ?? true
  const collectWhatsapp = config.collectWhatsapp ?? true
  const requiresContact = collectEmail || collectWhatsapp
  const submitLabel = config.submitLabel?.trim() || 'Send'
  const successMessage = config.successMessage?.trim() || 'Thanks. We will contact you soon.'

  const canSubmit = useMemo(() => {
    if (!requiresContact) return false
    const hasEmail = collectEmail && email.trim().length > 0
    const hasWhatsapp = collectWhatsapp && whatsapp.trim().length > 0
    return hasEmail || hasWhatsapp
  }, [collectEmail, collectWhatsapp, email, whatsapp, requiresContact])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || loading) return

    setLoading(true)
    setStatus('idle')

    try {
      const attribution = getAttributionBundle()
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: collectName ? name : null,
          email: collectEmail ? email : null,
          whatsapp: collectWhatsapp ? whatsapp : null,
          source: config.source ?? (postSlug ? `blog:${postSlug}` : 'blog'),
          block_id: config.blockId ?? null,
          post_id: postId ?? null,
          ...attribution.first,
          first_seen_attribution: attribution.first,
          last_seen_attribution: attribution.last,
        }),
      })

      if (!response.ok) throw new Error('request-failed')

      setStatus('success')
      setName('')
      setEmail('')
      setWhatsapp('')
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="my-10 rounded-2xl border border-[#08507f]/20 bg-gradient-to-br from-[#08507f]/5 to-white p-6 sm:p-8 not-prose">
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{config.title}</h3>
      {config.description && <p className="mt-2 text-slate-600">{config.description}</p>}

      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        {collectName && (
          <input
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          />
        )}

        {collectEmail && (
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="Email address"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          />
        )}

        {collectWhatsapp && (
          <input
            type="text"
            value={whatsapp}
            onChange={event => setWhatsapp(event.target.value)}
            placeholder="WhatsApp number"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          />
        )}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="inline-flex items-center justify-center rounded-xl bg-[#08507f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#063a5c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Sending...' : submitLabel}
        </button>

        {status === 'success' && <p className="text-sm font-medium text-emerald-700">{successMessage}</p>}
        {status === 'error' && <p className="text-sm font-medium text-red-700">Submission failed. Please try again.</p>}
      </form>
    </section>
  )
}
