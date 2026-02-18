import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditPageClient from './EditPageClient'

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('blog_pages')
    .select('*')
    .eq('id', id)
    .single()

  if (!page) notFound()

  return <EditPageClient page={page} />
}
