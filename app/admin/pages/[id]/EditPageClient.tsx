'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PostEditor from '@/components/admin/PostEditor'
import { Save, Eye, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { BlogPage } from '@/lib/types'

export default function EditPageClient({ page }: { page: BlogPage }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(page.title)
  const [slug, setSlug] = useState(page.slug)
  const [content, setContent] = useState(page.content ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(page.status)

  const handleSave = useCallback(async (saveStatus: 'draft' | 'published') => {
    if (!title) return alert('Title is required')
    setSaving(true)
    const supabase = createClient()

    await supabase.from('blog_pages').update({
      title,
      slug,
      content,
      status: saveStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', page.id)

    setSaving(false)
    setStatus(saveStatus)
  }, [title, slug, content, page.id])

  async function handleDelete() {
    if (!confirm('Delete this page permanently? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('blog_pages').delete().eq('id', page.id)
    router.push('/admin/pages')
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Edit Page</h1>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            status === 'published' ? 'bg-[#08507f]/10 text-[#08507f]' : 'bg-gray-100 text-gray-600'
          }`}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            <Eye size={15} /> Preview
          </Link>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Save size={15} /> Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#08507f] text-white rounded-lg hover:bg-[#063a5c] disabled:opacity-50"
          >
            <Eye size={15} /> Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Page title…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-2xl font-bold border-0 border-b border-gray-200 pb-3 focus:outline-none focus:border-[#08507f] bg-transparent placeholder-gray-300"
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">Slug:</span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="text-xs text-gray-500 border-0 focus:outline-none bg-transparent flex-1"
              />
            </div>
          </div>
          <PostEditor content={content} onChange={setContent} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700 mb-1">URL</p>
            <p className="font-mono text-xs break-all">/{slug}</p>
            <p className="text-xs text-gray-400 mt-1">
              Created {new Date(page.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-xl border border-red-100 p-4">
            <h3 className="text-sm font-semibold text-red-600 mb-3">Danger Zone</h3>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              <Trash2 size={14} /> Delete this page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
