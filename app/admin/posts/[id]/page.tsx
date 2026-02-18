import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditPostClient from './EditPostClient'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [postRes, catRes, tagRes, postCatRes, postTagRes] = await Promise.all([
    supabase.from('posts').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, name, slug').order('name'),
    supabase.from('tags').select('id, name, slug').order('name'),
    supabase.from('post_categories').select('category_id').eq('post_id', id),
    supabase.from('post_tags').select('tag_id').eq('post_id', id),
  ])

  if (!postRes.data) notFound()

  return (
    <EditPostClient
      post={postRes.data}
      allCategories={catRes.data ?? []}
      allTags={tagRes.data ?? []}
      selectedCategoryIds={(postCatRes.data ?? []).map(r => r.category_id)}
      selectedTagIds={(postTagRes.data ?? []).map(r => r.tag_id)}
    />
  )
}
