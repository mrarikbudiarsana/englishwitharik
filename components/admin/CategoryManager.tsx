'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Tag } from 'lucide-react'
import type { Category, Tag as TagType } from '@/lib/types'

interface Props {
  initialCategories: Category[]
  initialTags: TagType[]
}

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export default function CategoryManager({ initialCategories, initialTags }: Props) {
  const supabase = createClient()
  const [categories, setCategories] = useState(initialCategories)
  const [tags, setTags] = useState(initialTags)
  const [newCatName, setNewCatName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [loading, setLoading] = useState(false)

  async function addCategory() {
    if (!newCatName.trim()) return
    setLoading(true)
    const slug = generateSlug(newCatName)
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: newCatName.trim(), slug })
      .select()
      .single()
    if (!error && data) {
      setCategories(c => [...c, data])
      setNewCatName('')
    } else if (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return
    await supabase.from('categories').delete().eq('id', id)
    setCategories(c => c.filter(x => x.id !== id))
  }

  async function addTag() {
    if (!newTagName.trim()) return
    setLoading(true)
    const slug = generateSlug(newTagName)
    const { data, error } = await supabase
      .from('tags')
      .insert({ name: newTagName.trim(), slug })
      .select()
      .single()
    if (!error && data) {
      setTags(t => [...t, data])
      setNewTagName('')
    } else if (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  async function deleteTag(id: string) {
    if (!confirm('Delete this tag?')) return
    await supabase.from('tags').delete().eq('id', id)
    setTags(t => t.filter(x => x.id !== id))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Categories */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Categories</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            placeholder="New category name…"
            className="flex-1 text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          />
          <button
            onClick={addCategory}
            disabled={loading || !newCatName.trim()}
            className="flex items-center gap-1.5 bg-[#08507f] text-white text-sm px-3 py-2 rounded-lg hover:bg-[#063a5c] transition-colors disabled:opacity-50"
          >
            <Plus size={15} /> Add
          </button>
        </div>

        <ul className="space-y-2">
          {categories.length === 0 && (
            <li className="text-sm text-gray-400 py-2">No categories yet.</li>
          )}
          {categories.map(cat => (
            <li key={cat.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 group">
              <div>
                <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                <p className="text-xs text-gray-400">{cat.slug}</p>
              </div>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Tags</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            placeholder="New tag name…"
            className="flex-1 text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          />
          <button
            onClick={addTag}
            disabled={loading || !newTagName.trim()}
            className="flex items-center gap-1.5 bg-[#08507f] text-white text-sm px-3 py-2 rounded-lg hover:bg-[#063a5c] transition-colors disabled:opacity-50"
          >
            <Plus size={15} /> Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.length === 0 && (
            <p className="text-sm text-gray-400">No tags yet.</p>
          )}
          {tags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full group"
            >
              <Tag size={11} />
              {tag.name}
              <button
                onClick={() => deleteTag(tag.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
