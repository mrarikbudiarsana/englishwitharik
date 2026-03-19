import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdminJson } from '@/lib/admin/auth'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: Request) {
  const { error: authError } = await requireAdminJson()
  if (authError) return authError

  const body = await request.json().catch(() => null) as {
    slug?: string
    title?: string
    description?: string
    cta_label?: string
    is_published?: boolean
    cover_image_url?: string
  } | null

  if (!body?.title) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
  }

  const slug = slugify(body.slug || body.title)
  if (!slug) {
    return NextResponse.json({ error: 'A valid slug is required.' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { data: newSet, error } = await supabase
    .from('toefl_test_sets')
    .insert({
      slug,
      title: body.title,
      description: body.description ?? '',
      cta_label: body.cta_label || 'Start Test',
      is_published: Boolean(body.is_published),
      cover_image_url: body.cover_image_url || null,
    })
    .select('id')
    .single()

  if (error || !newSet) {
    console.error('Create TOEFL test set error:', error)
    return NextResponse.json({ error: 'Failed to create test set.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: newSet.id })
}
