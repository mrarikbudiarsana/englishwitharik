'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUIZ_TYPE_LABELS, QUIZ_TYPES } from '@/lib/quiz/types'
import type { QuizType } from '@/lib/quiz/types'

interface QuizEditorProps {
  mode: 'create' | 'edit'
  initialValue?: {
    id?: string
    slug: string
    title: string
    description: string
    type: QuizType
    is_published: boolean
    cover_image_url: string
    passage: string
    audio_url: string
    questions: Array<{ id: string; text: string; options: string[]; correctAnswerIndex: number }>
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function QuizEditor({ mode, initialValue }: QuizEditorProps) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: initialValue?.title ?? '',
    slug: initialValue?.slug ?? '',
    type: (initialValue?.type ?? 'grammar') as QuizType,
    description: initialValue?.description ?? '',
    is_published: initialValue?.is_published ?? false,
    cover_image_url: initialValue?.cover_image_url ?? '',
    passage: initialValue?.passage ?? '',
    audio_url: initialValue?.audio_url ?? '',
    questions: JSON.stringify(initialValue?.questions ?? [], null, 2),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: mode === 'create' && current.slug === slugify(current.title)
        ? slugify(value)
        : current.slug,
    }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    let parsedQuestions: unknown[]
    try {
      parsedQuestions = JSON.parse(form.questions)
      if (!Array.isArray(parsedQuestions)) {
        throw new Error('Questions must be a JSON array.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid JSON in questions field.')
      setSaving(false)
      return
    }

    const payload = {
      title: form.title,
      slug: form.slug,
      type: form.type,
      description: form.description,
      is_published: form.is_published,
      cover_image_url: form.cover_image_url || null,
      passage: form.type === 'reading' ? (form.passage || null) : null,
      audio_url: form.type === 'listening' ? (form.audio_url || null) : null,
      questions: parsedQuestions,
    }

    const url = mode === 'create'
      ? '/api/admin/quizzes'
      : `/api/admin/quizzes/${initialValue?.id}`

    try {
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to save quiz.')
      }

      if (mode === 'create' && data?.id) {
        router.push(`/admin/quizzes/${data.id}`)
        router.refresh()
        return
      }

      setSuccess('Quiz saved successfully.')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!initialValue?.id) return
    if (!window.confirm(`Are you sure you want to delete the quiz "${form.title}"? This action cannot be undone.`)) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch(`/api/admin/quizzes/${initialValue.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to delete quiz.')
      }

      router.push('/admin/quizzes')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz.')
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

      {success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Title</span>
          <input
            value={form.title}
            onChange={(event) => handleTitleChange(event.target.value)}
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

      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Type</span>
          <select
            value={form.type}
            onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as QuizType }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
          >
            {QUIZ_TYPES.map((t) => (
              <option key={t} value={t}>
                {QUIZ_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Cover Image URL</span>
          <input
            value={form.cover_image_url}
            onChange={(event) => setForm((current) => ({ ...current, cover_image_url: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
            placeholder="https://..."
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        <span>Description</span>
        <textarea
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          rows={3}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
        />
      </label>

      {form.type === 'reading' ? (
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Passage</span>
          <textarea
            value={form.passage}
            onChange={(event) => setForm((current) => ({ ...current, passage: event.target.value }))}
            rows={8}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-mono focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
            placeholder="Enter the reading passage text..."
          />
        </label>
      ) : null}

      {form.type === 'listening' ? (
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Audio URL</span>
          <input
            value={form.audio_url}
            onChange={(event) => setForm((current) => ({ ...current, audio_url: event.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
            placeholder="https://...mp3"
          />
        </label>
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

      <label className="block space-y-2 text-sm font-medium text-slate-700">
        <span>Questions (JSON)</span>
        <textarea
          value={form.questions}
          onChange={(event) => setForm((current) => ({ ...current, questions: event.target.value }))}
          rows={16}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-mono leading-relaxed focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
          spellCheck={false}
        />
      </label>

      <div className="flex justify-between items-center gap-4">
        {mode === 'edit' && initialValue?.id && (
          <button
            type="button"
            disabled={saving}
            onClick={handleDelete}
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-200"
          >
            Delete quiz
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#08507f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#063a5c] disabled:cursor-not-allowed disabled:opacity-60 ml-auto"
        >
          {saving ? 'Saving...' : mode === 'create' ? 'Create quiz' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
