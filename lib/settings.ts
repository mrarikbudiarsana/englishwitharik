import { createClient } from '@/lib/supabase/server'

export interface SiteSettings {
  // Contact
  email: string
  whatsapp: string

  // Social Links
  instagram: string
  youtube: string
  tiktok: string
  threads: string

  // Business Info
  location_address: string
  location_city: string
  business_hours: string
}

const defaults: SiteSettings = {
  email: 'info@englishwitharik.com',
  whatsapp: '+6282144223581',
  instagram: 'https://instagram.com/englishwitharik',
  youtube: 'https://youtube.com/@englishwitharik',
  tiktok: 'https://tiktok.com/@englishwitharik',
  threads: 'https://threads.net/@englishwitharik',
  location_address: 'Desa Sangsit, Buleleng, Bali',
  location_city: 'Indonesia 81171',
  business_hours: '7:00 AM - 11:00 PM (GMT+8)',
}

export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('site_settings').select('key, value')

  const settings = { ...defaults }

  for (const row of rows ?? []) {
    if (row.key in settings) {
      const value = typeof row.value === 'string'
        ? row.value.replace(/^"|"$/g, '')
        : row.value
      ;(settings as Record<string, string>)[row.key] = value || defaults[row.key as keyof SiteSettings]
    }
  }

  return settings
}

export function formatWhatsAppLink(number: string): string {
  // Remove all non-digits except leading +
  const cleaned = number.replace(/[^\d+]/g, '').replace(/^\+/, '')
  return `https://wa.me/${cleaned}`
}

export function formatWhatsAppDisplay(number: string): string {
  // Format for display: +62 821 4422 3581
  const cleaned = number.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+62') || cleaned.startsWith('62')) {
    const digits = cleaned.replace(/^\+?62/, '')
    return `+62 ${digits.slice(0,3)} ${digits.slice(3,7)} ${digits.slice(7)}`
  }
  return cleaned
}
