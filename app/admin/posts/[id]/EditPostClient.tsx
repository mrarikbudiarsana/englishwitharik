'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PostEditor from '@/components/admin/PostEditor'
import { Save, Eye, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Post, Category, Tag } from '@/lib/types'
import { validateInteractiveShortcodes } from '@/lib/interactive/shortcodes'

interface Props {
  post: Post
  allCategories: Category[]
  allTags: Tag[]
  selectedCategoryIds: string[]
  selectedTagIds: string[]
}

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export default function EditPostClient({ post, allCategories, allTags, selectedCategoryIds, selectedTagIds }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(post.title)
  const [slug, setSlug] = useState(post.slug)
  const [content, setContent] = useState(post.content ?? '')
  const [excerpt, setExcerpt] = useState(post.excerpt ?? '')
  const [featuredImage, setFeaturedImage] = useState(post.featured_image_url ?? '')
  const [seoTitle, setSeoTitle] = useState(post.seo_title ?? '')
  const [seoDesc, setSeoDesc] = useState(post.seo_description ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(post.status)
  const [catIds, setCatIds] = useState<string[]>(selectedCategoryIds)
  const [tagIds, setTagIds] = useState<string[]>(selectedTagIds)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
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

    await supabase.from('posts').update({
      title,
      slug,
      content,
      excerpt: excerpt || null,
      featured_image_url: featuredImage || null,
      seo_title: seoTitle || null,
      seo_description: seoDesc || null,
      status: saveStatus,
      published_at: saveStatus === 'published' && !post.published_at
        ? new Date().toISOString()
        : post.published_at,
      updated_at: new Date().toISOString(),
    }).eq('id', post.id)

    // Sync categories
    await supabase.from('post_categories').delete().eq('post_id', post.id)
    if (catIds.length > 0) {
      await supabase.from('post_categories').insert(
        catIds.map(cid => ({ post_id: post.id, category_id: cid }))
      )
    }

    // Sync tags
    await supabase.from('post_tags').delete().eq('post_id', post.id)
    if (tagIds.length > 0) {
      await supabase.from('post_tags').insert(
        tagIds.map(tid => ({ post_id: post.id, tag_id: tid }))
      )
    }

    setSaving(false)
    setStatus(saveStatus)
  }, [title, slug, content, excerpt, featuredImage, seoTitle, seoDesc, catIds, tagIds, post.id, post.published_at])

  async function handleDelete() {
    if (!confirm('Delete this post permanently? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('posts').delete().eq('id', post.id)
    router.push('/admin/posts')
  }

  function toggleCategory(id: string) {
    setCatIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function toggleTag(id: string) {
    setTagIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/posts" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Edit Post</h1>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status === 'published' ? 'bg-[#08507f]/10 text-[#08507f]' : 'bg-gray-100 text-gray-600'
            }`}>
            {status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/blog/${slug}`} target="_blank" className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
            <Eye size={15} /> Preview
          </Link>
          <button onClick={() => handleSave('draft')} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            <Save size={15} /> Save Draft
          </button>
          <button onClick={() => handleSave('published')} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#08507f] text-white rounded-lg hover:bg-[#063a5c] disabled:opacity-50">
            <Eye size={15} /> Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <input type="text" placeholder="Post title…" value={title} onChange={handleTitleChange}
              className="w-full text-2xl font-bold border-0 border-b border-gray-200 pb-3 focus:outline-none focus:border-[#08507f] bg-transparent placeholder-gray-300" />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">Slug:</span>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)}
                className="text-xs text-gray-500 border-0 focus:outline-none bg-transparent flex-1" />
            </div>
          </div>
          <PostEditor content={content} onChange={setContent} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status</h3>
            <select value={status} onChange={e => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f]">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Featured Image</h3>
            <input type="url" placeholder="Paste Cloudinary URL…" value={featuredImage} onChange={e => setFeaturedImage(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f]" />
            {featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featuredImage} alt="Preview" className="mt-3 rounded-lg w-full object-cover aspect-video" />
            )}
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {allCategories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={catIds.includes(cat.id)} onChange={() => toggleCategory(cat.id)}
                    className="rounded border-gray-300 text-[#08507f] focus:ring-[#08507f]" />
                  <span className="text-sm text-gray-700">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map(tag => (
                <button key={tag.id} onClick={() => toggleTag(tag.id)} type="button"
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${tagIds.includes(tag.id) ? 'bg-[#08507f] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Excerpt</h3>
            <textarea placeholder="Short description…" value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3}
              className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-none" />
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">SEO Title</label>
                <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title}
                  className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Meta Description</label>
                <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} rows={2} maxLength={160}
                  className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-none" />
                <p className="text-xs text-gray-400 text-right mt-1">{seoDesc.length}/160</p>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-xl border border-red-100 p-4">
            <h3 className="text-sm font-semibold text-red-600 mb-3">Danger Zone</h3>
            <button onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium">
              <Trash2 size={14} /> Delete this post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
