'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Image as ImageIcon, AlertCircle, Check } from 'lucide-react'
import MediaPickerModal from './MediaPickerModal'
import Link from 'next/link'

interface EditorProps {
  slug: string
  settingsKey: string
  initialData: any
}

export default function LandingPageEditor({ slug, settingsKey, initialData }: EditorProps) {
  const [data, setData] = useState(initialData?.hero ? initialData : { hero: {} })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatus('idle')

    const supabase = createClient()
    const { error } = await supabase.from('site_settings').upsert({
      key: settingsKey,
      value: JSON.stringify(data),
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' })

    setSaving(false)
    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
    } else {
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const handleChange = (field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }))
  }

  return (
    <>
      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Hero Section</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={data.hero?.title || ''}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Leave blank to use default hardcoded title"
              className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={data.hero?.description || ''}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Leave blank to use default hardcoded description"
              className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={data.hero?.image || ''}
                readOnly
                placeholder="Click the button to select an image from your library"
                className="w-full text-sm border border-gray-300 bg-gray-50 rounded-lg py-2 px-3 focus:outline-none text-gray-500"
              />
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
              >
                <ImageIcon size={16} /> Choose Image
              </button>
            </div>
            {data.hero?.image && (
              <div className="mt-3">
                <img src={data.hero.image} alt="Hero Preview" className="max-h-40 rounded border border-gray-200 object-cover" />
                <button 
                  type="button" 
                  onClick={() => handleChange('image', '')}
                  className="text-xs text-red-500 mt-1 hover:underline"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#08507f] hover:bg-[#063a5c] text-white text-sm font-medium py-2 px-5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <Link href="/admin/landing-pages" className="text-sm text-gray-500 hover:underline">
            Cancel
          </Link>

          {status === 'saved' && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium ml-2">
              <Check size={15} /> Saved successfully
            </span>
          )}

          {status === 'error' && (
            <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium ml-2">
              <AlertCircle size={15} /> {errorMessage}
            </span>
          )}
        </div>
      </form>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => handleChange('image', url)}
      />
    </>
  )
}
