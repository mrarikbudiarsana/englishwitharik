'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Mail, Phone, Instagram, Youtube, MapPin, Clock, AlertCircle, Check } from 'lucide-react'

interface Props {
  initialSettings: Record<string, string>
}

interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'email' | 'url' | 'tel'
  placeholder: string
  icon: React.ReactNode
  validate?: (value: string) => string | null
}

interface FieldGroup {
  title: string
  description: string
  fields: FieldConfig[]
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const urlRegex = /^https?:\/\/.+/
const phoneRegex = /^\+?[\d\s-]{8,}$/

const fieldGroups: FieldGroup[] = [
  {
    title: 'Contact Information',
    description: 'Primary contact details displayed across the site',
    fields: [
      {
        key: 'email',
        label: 'Contact Email',
        type: 'email',
        placeholder: 'info@englishwitharik.com',
        icon: <Mail size={16} />,
        validate: (v) => v && !emailRegex.test(v) ? 'Invalid email format' : null,
      },
      {
        key: 'whatsapp',
        label: 'WhatsApp Number',
        type: 'tel',
        placeholder: '+6282144223581',
        icon: <Phone size={16} />,
        validate: (v) => v && !phoneRegex.test(v) ? 'Include country code (e.g., +62...)' : null,
      },
    ],
  },
  {
    title: 'Social Media Links',
    description: 'Social media profile URLs shown in the footer',
    fields: [
      {
        key: 'instagram',
        label: 'Instagram',
        type: 'url',
        placeholder: 'https://instagram.com/englishwitharik',
        icon: <Instagram size={16} />,
        validate: (v) => v && !urlRegex.test(v) ? 'Must be a full URL (https://...)' : null,
      },
      {
        key: 'youtube',
        label: 'YouTube',
        type: 'url',
        placeholder: 'https://youtube.com/@englishwitharik',
        icon: <Youtube size={16} />,
        validate: (v) => v && !urlRegex.test(v) ? 'Must be a full URL (https://...)' : null,
      },
      {
        key: 'tiktok',
        label: 'TikTok',
        type: 'url',
        placeholder: 'https://tiktok.com/@englishwitharik',
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.92-.23-2.74.29-.62.38-1.09.98-1.24 1.7-.15.48-.15.98-.02 1.47.11.45.34.87.66 1.2.62.65 1.5 1 2.39 1.05.77.06 1.34-.14 1.83-.55.6-.48.91-1.19.95-1.96.04-1.41.02-2.82.02-4.23.01-4.5.01-9 0-13.5z" />
          </svg>
        ),
        validate: (v) => v && !urlRegex.test(v) ? 'Must be a full URL (https://...)' : null,
      },
      {
        key: 'threads',
        label: 'Threads',
        type: 'url',
        placeholder: 'https://threads.net/@englishwitharik',
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.781 3.632 2.698 6.542 2.717 2.227-.025 4.073-.645 5.487-1.844.982-.826 1.726-1.89 2.21-3.166l1.987.668c-.581 1.559-1.503 2.876-2.74 3.916-1.73 1.465-3.968 2.258-6.65 2.358-.114.003-.229.003-.343.004Zm4.683-7.793c-.729 3.073-2.972 4.64-6.683 4.64-.396 0-.807-.02-1.23-.064-2.37-.242-4.109-1.186-5.17-2.81-.949-1.447-1.456-3.39-1.506-5.778v-.202c.05-2.387.557-4.33 1.506-5.777 1.06-1.624 2.8-2.568 5.17-2.81.424-.044.835-.064 1.23-.064 3.71 0 5.954 1.566 6.683 4.64.324 1.376.436 2.905.438 4.613l-.003.619c-.002 1.713-.114 3.238-.435 4.593Zm-1.916-8.407c-.477-2.03-1.954-3.068-4.384-3.068-.29 0-.591.015-.901.044-1.667.168-2.888.735-3.63 1.686-.691.889-1.07 2.158-1.118 3.784l-.003.189v.166c.003.034.003.069.003.103v.098l.003.194c.048 1.626.427 2.895 1.118 3.783.742.951 1.963 1.518 3.63 1.686.31.029.611.044.9.044 2.43 0 3.908-1.038 4.385-3.068.27-1.157.358-2.412.363-3.82v-.01c-.005-1.408-.094-2.664-.366-3.821Z"/>
          </svg>
        ),
        validate: (v) => v && !urlRegex.test(v) ? 'Must be a full URL (https://...)' : null,
      },
    ],
  },
  {
    title: 'Business Information',
    description: 'Location and hours displayed in the footer',
    fields: [
      {
        key: 'location_address',
        label: 'Address',
        type: 'text',
        placeholder: 'Desa Sangsit, Buleleng, Bali',
        icon: <MapPin size={16} />,
      },
      {
        key: 'location_city',
        label: 'City/Postal Code',
        type: 'text',
        placeholder: 'Indonesia 81171',
        icon: <MapPin size={16} />,
      },
      {
        key: 'business_hours',
        label: 'Business Hours',
        type: 'text',
        placeholder: '7:00 AM - 11:00 PM (GMT+8)',
        icon: <Clock size={16} />,
      },
    ],
  },
]

export default function SettingsForm({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validateAll(): boolean {
    const newErrors: Record<string, string> = {}
    for (const group of fieldGroups) {
      for (const field of group.fields) {
        if (field.validate) {
          const error = field.validate(settings[field.key] ?? '')
          if (error) newErrors[field.key] = error
        }
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setStatus('idle')
    setErrorMessage('')

    if (!validateAll()) return

    setSaving(true)
    const supabase = createClient()

    const upserts = Object.entries(settings)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => ({
        key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString(),
      }))

    const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' })

    setSaving(false)

    if (error) {
      setStatus('error')
      setErrorMessage(error.message || 'Failed to save settings')
    } else {
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  function handleChange(key: string, value: string) {
    setSettings(s => ({ ...s, [key]: value }))
    // Clear error when user edits
    if (errors[key]) {
      setErrors(e => {
        const next = { ...e }
        delete next[key]
        return next
      })
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {fieldGroups.map(group => (
        <div key={group.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">{group.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
          </div>
          <div className="p-5 space-y-4">
            {group.fields.map(field => (
              <div key={field.key}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <span className="text-gray-400">{field.icon}</span>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={settings[field.key] ?? ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full text-sm border rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#08507f] transition-colors ${
                    errors[field.key]
                      ? 'border-red-300 bg-red-50 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors[field.key] && (
                  <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
                    <AlertCircle size={12} />
                    {errors[field.key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-[#08507f] hover:bg-[#063a5c] text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={15} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        {status === 'saved' && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <Check size={15} />
            Saved successfully
          </span>
        )}

        {status === 'error' && (
          <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
            <AlertCircle size={15} />
            {errorMessage}
          </span>
        )}
      </div>
    </form>
  )
}
