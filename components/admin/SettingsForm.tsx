'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save } from 'lucide-react'

interface Props {
  initialSettings: Record<string, string>
}

const fields = [
  { key: 'site_title', label: 'Site Title', type: 'text' },
  { key: 'site_description', label: 'Site Description', type: 'text' },
  { key: 'hero_title', label: 'Hero Title', type: 'text' },
  { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'text' },
  { key: 'whatsapp', label: 'WhatsApp Number', type: 'text', placeholder: '+628214422358' },
  { key: 'email', label: 'Contact Email', type: 'email' },
  { key: 'instagram', label: 'Instagram URL', type: 'url' },
  { key: 'youtube', label: 'YouTube URL', type: 'url' },
]

export default function SettingsForm({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()

    const upserts = Object.entries(settings).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
      updated_at: new Date().toISOString(),
    }))

    await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {fields.map(field => (
        <div key={field.key} className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
          <input
            type={field.type}
            value={settings[field.key] ?? ''}
            onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
            className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          />
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-[#08507f] hover:bg-[#063a5c] text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={15} />
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && <span className="text-sm text-[#08507f] font-medium">✓ Saved!</span>}
      </div>
    </form>
  )
}
