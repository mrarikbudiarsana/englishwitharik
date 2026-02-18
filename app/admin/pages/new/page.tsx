'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PostEditor from '@/components/admin/PostEditor'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function NewPagePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setSlug(generateSlug(e.target.value))
  }

  const handleSave = useCallback(async (saveStatus: 'draft' | 'published') => {
    if (!title) return alert('Title is required')
    if (!slug) return alert('Slug is required')
    setSaving(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('blog_pages')
      .insert({ title, slug, content, status: saveStatus })
      .select('id')
      .single()

    setSaving(false)
    if (error) { alert(error.message); return }
    router.push(`/admin/pages/${data.id}`)
  }, [title, slug, content, router])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">New Page</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#08507f] text-white rounded-lg hover:bg-[#063a5c] transition-colors disabled:opacity-50"
          >
            <Eye size={15} />
            Publish
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
              onChange={handleTitleChange}
              className="w-full text-2xl font-bold border-0 border-b border-gray-200 pb-3 focus:outline-none focus:border-[#08507f] bg-transparent placeholder-gray-300"
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">Slug:</span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="text-xs text-gray-500 border-0 focus:outline-none bg-transparent flex-1"
                placeholder="page-slug"
              />
            </div>
          </div>
          <PostEditor content={content} onChange={setContent} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Publish</h3>
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
            <p className="font-semibold text-gray-700 mb-2">Tips</p>
            <p>Use a short, descriptive slug like <code className="bg-gray-100 px-1 rounded">about</code> or <code className="bg-gray-100 px-1 rounded">pricing</code>.</p>
            <p>The page will be accessible at <code className="bg-gray-100 px-1 rounded">/{slug || 'your-slug'}</code>.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
