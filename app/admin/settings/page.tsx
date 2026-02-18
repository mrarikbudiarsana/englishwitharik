import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('site_settings').select('*')

  const settings: Record<string, string> = {}
  for (const row of rows ?? []) {
    settings[row.key] = typeof row.value === 'string'
      ? row.value.replace(/^"|"$/g, '')
      : row.value
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Configure your site&apos;s global settings.</p>
      <SettingsForm initialSettings={settings} />
    </div>
  )
}
