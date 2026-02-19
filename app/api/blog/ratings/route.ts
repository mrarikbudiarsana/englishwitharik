import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface RatingPayload {
  post_id?: string
  rating?: number
  session_id?: string
  path?: string | null
}

function sanitizeText(input: string | null | undefined, maxLength: number) {
  if (!input) return null
  const value = input.trim()
  if (!value) return null
  return value.slice(0, maxLength)
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RatingPayload
    const postIdRaw = sanitizeText(body.post_id, 64)
    const sessionId = sanitizeText(body.session_id, 120)
    const path = sanitizeText(body.path ?? null, 300)
    const rating = Number(body.rating)

    if (!postIdRaw || !isUuid(postIdRaw)) {
      return NextResponse.json({ error: 'Invalid post_id' }, { status: 400 })
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('post_ratings')
      .upsert(
        {
          post_id: postIdRaw,
          rating,
          session_id: sessionId,
          path,
        },
        { onConflict: 'post_id,session_id' }
      )

    if (error) {
      return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const postIdRaw = sanitizeText(url.searchParams.get('post_id'), 64)
  if (!postIdRaw || !isUuid(postIdRaw)) {
    return NextResponse.json({ error: 'Invalid post_id' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('post_ratings')
    .select('rating')
    .eq('post_id', postIdRaw)

  if (error) {
    return NextResponse.json({ error: 'Failed to load ratings' }, { status: 500 })
  }

  const rows = data ?? []
  const count = rows.length
  const average = count > 0
    ? Number((rows.reduce((sum, row) => sum + Number(row.rating || 0), 0) / count).toFixed(1))
    : 0

  return NextResponse.json({ average, count })
}
