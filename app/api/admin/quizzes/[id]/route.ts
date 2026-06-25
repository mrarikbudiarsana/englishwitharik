import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdminJson } from '@/lib/admin/auth'
import { QUIZ_TYPES } from '@/lib/quiz/types'
import type { QuizType } from '@/lib/quiz/types'

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
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to load quiz.' }, { status: 404 })
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
    type?: string
    is_published?: boolean
    cover_image_url?: string
    passage?: string
    audio_url?: string
    questions?: unknown[]
  } | null

  if (!body?.title) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
  }

  if (body.type && !QUIZ_TYPES.includes(body.type as QuizType)) {
    return NextResponse.json({ error: 'A valid type is required (grammar, vocabulary, reading, listening).' }, { status: 400 })
  }

  const slug = slugify(body.slug || body.title)
  if (!slug) {
    return NextResponse.json({ error: 'A valid slug is required.' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('quizzes')
    .update({
      slug,
      title: body.title,
      description: body.description ?? '',
      type: body.type,
      is_published: Boolean(body.is_published),
      cover_image_url: body.cover_image_url || null,
      passage: body.passage || null,
      audio_url: body.audio_url || null,
      questions: body.questions ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Update quiz error:', error)
    return NextResponse.json({ error: 'Failed to update quiz.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireAdminJson()
  if (authError) return authError

  const { id } = await params
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete quiz error:', error)
    return NextResponse.json({ error: 'Failed to delete quiz.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
