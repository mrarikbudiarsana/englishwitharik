'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PostEditor from '@/components/admin/PostEditor'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { validateInteractiveShortcodes } from '@/lib/interactive/shortcodes'

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function NewPostPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDesc, setSeoDesc] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setSlug(generateSlug(e.target.value))
  }

  const handleSave = useCallback(async (saveStatus: 'draft' | 'published') => {
    if (!title) return alert('Title is required')
    const issues = validateInteractiveShortcodes(content)
    if (issues.length > 0) {
      const preview = issues.slice(0, 3).map(issue => `#${issue.index} ${issue.blockType}: ${issue.message}`).join('\n')
      alert(`Fix interactive block errors before saving:\n${preview}${issues.length > 3 ? `\n...and ${issues.length - 3} more.` : ''}`)
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('posts').insert({
      title,
      slug,
      content,
      excerpt,
      featured_image_url: featuredImage || null,
      seo_title: seoTitle || null,
      seo_description: seoDesc || null,
      status: saveStatus,
      published_at: saveStatus === 'published' ? new Date().toISOString() : null,
      author_id: user?.id,
    }).select('id').single()

    setSaving(false)
    if (error) { alert(error.message); return }
    router.push(`/admin/posts/${data.id}`)
  }, [title, slug, content, excerpt, featuredImage, seoTitle, seoDesc, router])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/posts" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">New Post</h1>
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
              placeholder="Post title…"
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
                placeholder="post-slug"
              />
            </div>
          </div>
          <PostEditor content={content} onChange={setContent} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
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

          {/* Featured Image */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Featured Image</h3>
            <input
              type="url"
              placeholder="Paste Cloudinary URL…"
              value={featuredImage}
              onChange={e => setFeaturedImage(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
            />
            {featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featuredImage} alt="Preview" className="mt-3 rounded-lg w-full object-cover aspect-video" />
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Excerpt</h3>
            <textarea
              placeholder="Short description of this post…"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              rows={3}
              className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-none"
            />
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  placeholder={title || 'SEO title…'}
                  className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Meta Description</label>
                <textarea
                  value={seoDesc}
                  onChange={e => setSeoDesc(e.target.value)}
                  placeholder="Meta description…"
                  rows={2}
                  maxLength={160}
                  className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{seoDesc.length}/160</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
