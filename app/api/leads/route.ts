import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface LeadPayload {
  name?: string | null
  email?: string | null
  whatsapp?: string | null
  source?: string | null
  block_id?: string | null
  post_id?: string | null
}

function sanitize(input: string | null | undefined, maxLength: number) {
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
    const body = (await req.json()) as LeadPayload

    const name = sanitize(body.name, 120)
    const email = sanitize(body.email, 255)
    const whatsapp = sanitize(body.whatsapp, 40)
    const source = sanitize(body.source, 200) ?? 'blog'
    const blockId = sanitize(body.block_id, 120)
    const rawPostId = sanitize(body.post_id, 64)
    const postId = rawPostId && isUuid(rawPostId) ? rawPostId : null

    if (!email && !whatsapp) {
      return NextResponse.json({ error: 'Email or WhatsApp is required.' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { error } = await supabase.from('leads').insert({
      name,
      email,
      whatsapp,
      source,
      block_id: blockId,
      post_id: postId,
      status: 'new',
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to store lead.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
