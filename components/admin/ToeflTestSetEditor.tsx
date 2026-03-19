'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ToeflTestSetEditorProps {
  mode: 'create' | 'edit'
  initialValue?: {
    id?: string
    slug: string
    title: string
    description: string
    cta_label: string
    is_published: boolean
    cover_image_url: string | null
  }
}

export default function ToeflTestSetEditor({
  mode,
  initialValue,
}: ToeflTestSetEditorProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    slug: initialValue?.slug ?? '',
    title: initialValue?.title ?? '',
    description: initialValue?.description ?? '',
    cta_label: initialValue?.cta_label ?? 'Start Test',
    is_published: initialValue?.is_published ?? false,
    cover_image_url: initialValue?.cover_image_url ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const url = mode === 'create'
      ? '/api/admin/toefl/test-sets'
      : `/api/admin/toefl/test-sets/${initialValue?.id}`

    try {
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.error ?? 'Failed to save test set.')
      }

      if (mode === 'create' && payload?.id) {
        router.push(`/admin/toefl/test-sets/${payload.id}`)
        router.refresh()
        return
      }

      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save test set.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Title</span>
          <input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Slug</span>
          <input
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
            required
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        <span>Description</span>
        <textarea
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          rows={4}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
        />
      </label>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>CTA label</span>
          <input
            value={form.cta_label}
            onChange={(event) => setForm((current) => ({ ...current, cta_label: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Cover image URL</span>
          <input
            value={form.cover_image_url}
            onChange={(event) => setForm((current) => ({ ...current, cover_image_url: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
          />
        </label>
      </div>

      {form.cover_image_url ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Cover image preview</p>
          <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <Image
              src={form.cover_image_url}
              alt={form.title || 'TOEFL test set cover image'}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 768px, 100vw"
            />
          </div>
        </div>
      ) : null}

      <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={form.is_published}
          onChange={(event) => setForm((current) => ({ ...current, is_published: event.target.checked }))}
          className="h-4 w-4 rounded border-slate-300 text-[#08507f] focus:ring-[#08507f]"
        />
        <span>Published</span>
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#08507f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#063a5c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : mode === 'create' ? 'Create test set' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
