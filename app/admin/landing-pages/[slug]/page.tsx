import { createClient } from '@/lib/supabase/server'
import LandingPageEditor from '@/components/admin/LandingPageEditor'
import { notFound } from 'next/navigation'

const SUPPORTED_PAGES = ['toefl-ibt', 'pte-academic', 'ielts-preparation', 'general-english', 'business-english', 'english-for-specific-purposes']

export default async function AdminLandingPageEdit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  if (!SUPPORTED_PAGES.includes(slug)) {
    notFound()
  }

  const supabase = await createClient()
  const settingsKey = `page_${slug.replace(/-/g, '_')}`
  
  const { data: row } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', settingsKey)
    .single()

  const initialData = row?.value || { hero: {} }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">{slug.replace(/-/g, ' ')} Content</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit the hero text and image for this landing page. Leave fields blank to use the default hardcoded values.
        </p>
      </div>
      
      <LandingPageEditor slug={slug} initialData={initialData} settingsKey={settingsKey} />
    </div>
  )
}
