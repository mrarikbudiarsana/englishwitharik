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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireAdminJson()
  if (authError) return authError

  const { id } = await params
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('toefl_test_sets')
    .select(`
      *,
      toefl_test_set_sections (
        id,
        section,
        title,
        description,
        sort_order,
        is_enabled,
        updated_at
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to load test set.' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireAdminJson()
  if (authError) return authError

  const { id } = await params
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
  const { error } = await supabase
    .from('toefl_test_sets')
    .update({
      slug,
      title: body.title,
      description: body.description ?? '',
      cta_label: body.cta_label || 'Start Test',
      is_published: Boolean(body.is_published),
      cover_image_url: body.cover_image_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Update TOEFL test set error:', error)
    return NextResponse.json({ error: 'Failed to update test set.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
