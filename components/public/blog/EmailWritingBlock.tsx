'use client'

import { useMemo, useState } from 'react'

export interface EmailWritingConfig {
  title?: string
  prompt: string
  instructions?: string[]
  recipient?: string
  subject?: string
  placeholder?: string
  submitLabel?: string
  successMessage?: string
  source?: string
  blockId?: string
  collectName?: boolean
  collectEmail?: boolean
  collectWhatsapp?: boolean
}

interface EmailWritingBlockProps {
  config: EmailWritingConfig
  postId?: string
  postSlug?: string
}

export default function EmailWritingBlock({ config, postId, postSlug }: EmailWritingBlockProps) {
  const [response, setResponse] = useState('')
  const [showContactForm, setShowContactForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const collectName = config.collectName ?? true
  const rawCollectEmail = config.collectEmail ?? true
  const collectWhatsapp = config.collectWhatsapp ?? true
  const collectEmail = rawCollectEmail || !collectWhatsapp
  const requiresContact = true
  const firstStepLabel = config.submitLabel?.trim() || 'Submit response'
  const successMessage = config.successMessage?.trim() || 'Thanks. Your response has been submitted.'

  const hasResponse = response.trim().length > 0
  const canFinalSubmit = useMemo(() => {
    if (!hasResponse) return false
    if (!requiresContact) return true
    const hasEmail = collectEmail && email.trim().length > 0
    const hasWhatsapp = collectWhatsapp && whatsapp.trim().length > 0
    return hasEmail || hasWhatsapp
  }, [collectEmail, collectWhatsapp, email, hasResponse, requiresContact, whatsapp])

  async function handleFinalSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canFinalSubmit || loading) return

    setLoading(true)
    setStatus('idle')

    const submissionHeader = [
      config.recipient?.trim() ? `To: ${config.recipient.trim()}` : null,
      config.subject?.trim() ? `Subject: ${config.subject.trim()}` : null,
    ].filter(Boolean).join('\n')

    const submission = submissionHeader
      ? `${submissionHeader}\n\n${response.trim()}`
      : response.trim()

    try {
      const responseResult = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: collectName ? name : null,
          email: collectEmail ? email : null,
          whatsapp: collectWhatsapp ? whatsapp : null,
          source: config.source ?? (postSlug ? `blog:${postSlug}:email-writing` : 'blog:email-writing'),
          block_id: config.blockId ?? null,
          post_id: postId ?? null,
          submission,
        }),
      })

      if (!responseResult.ok) throw new Error('request-failed')

      setStatus('success')
      setResponse('')
      setName('')
      setEmail('')
      setWhatsapp('')
      setShowContactForm(false)
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="my-10 rounded-2xl border border-[#08507f]/20 bg-gradient-to-br from-[#08507f]/5 to-white p-6 sm:p-8 not-prose">
      {config.title && <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{config.title}</h3>}
      <div className={`mt-4 grid gap-5 ${config.prompt ? 'lg:grid-cols-2' : ''}`}>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Task</p>
          <p className="mt-2 text-sm whitespace-pre-wrap text-slate-700">{config.prompt}</p>
          {config.instructions && config.instructions.length > 0 && (
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
              {config.instructions.map((item, index) => (
                <li key={`instruction-${index}`}>{item}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          {config.recipient?.trim() && (
            <p className="text-sm text-slate-700">To: <span className="font-medium">{config.recipient.trim()}</span></p>
          )}
          {config.subject?.trim() && (
            <p className="text-sm text-slate-700">Subject: <span className="font-medium">{config.subject.trim()}</span></p>
          )}
          <textarea
            value={response}
            onChange={event => setResponse(event.target.value)}
            rows={10}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-y"
            placeholder={config.placeholder?.trim() || 'Write your email response here...'}
          />

          {!showContactForm && (
            <button
              type="button"
              disabled={!hasResponse}
              onClick={() => setShowContactForm(true)}
              className="inline-flex items-center justify-center rounded-xl bg-[#08507f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#063a5c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {firstStepLabel}
            </button>
          )}

          {showContactForm && (
            <form className="space-y-3 rounded-xl border border-slate-200 bg-white p-4" onSubmit={handleFinalSubmit}>
              <p className="text-sm font-semibold text-slate-900">Where should we send feedback?</p>
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

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!canFinalSubmit || loading}
                  className="inline-flex items-center justify-center rounded-xl bg-[#08507f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#063a5c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Send response'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {status === 'success' && <p className="text-sm font-medium text-emerald-700">{successMessage}</p>}
          {status === 'error' && <p className="text-sm font-medium text-red-700">Submission failed. Please try again.</p>}
        </div>
      </div>
    </section>
  )
}
