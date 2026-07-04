import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
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

export async function POST(request: Request) {
  const { error: authError } = await requireAdminJson()
  if (authError) return authError

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

  if (!body.type || !QUIZ_TYPES.includes(body.type as QuizType)) {
    return NextResponse.json({ error: 'A valid type is required (grammar, vocabulary, reading, listening).' }, { status: 400 })
  }

  const slug = slugify(body.slug || body.title)
  if (!slug) {
    return NextResponse.json({ error: 'A valid slug is required.' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { data: newQuiz, error } = await supabase
    .from('practice_quizzes')
    .insert({
      slug,
      title: body.title,
      description: body.description ?? '',
      type: body.type,
      is_published: Boolean(body.is_published),
      cover_image_url: body.cover_image_url || null,
      passage: body.passage || null,
      audio_url: body.audio_url || null,
      questions: body.questions ?? [],
    })
    .select('id')
    .single()

  if (error || !newQuiz) {
    console.error('Create quiz error:', error)
    return NextResponse.json({ error: 'Failed to create quiz.' }, { status: 500 })
  }

  // Purge the Next.js cache so the new quiz is immediately visible in the list
  try {
    revalidatePath('/practice')
    revalidatePath(`/practice/${slug}`)
  } catch (revalError) {
    console.error('Revalidation error:', revalError)
  }

  return NextResponse.json({ ok: true, id: newQuiz.id })
}
