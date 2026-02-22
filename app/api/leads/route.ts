import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface LeadPayload {
  name?: string | null
  email?: string | null
  whatsapp?: string | null
  source?: string | null
  block_id?: string | null
  post_id?: string | null
  submission?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
  gclid?: string | null
  fbclid?: string | null
  msclkid?: string | null
  first_seen_attribution?: unknown
  last_seen_attribution?: unknown
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

function sanitizeAttributionObject(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const obj = input as Record<string, unknown>
  return {
    utm_source: sanitize(typeof obj.utm_source === 'string' ? obj.utm_source : null, 200),
    utm_medium: sanitize(typeof obj.utm_medium === 'string' ? obj.utm_medium : null, 200),
    utm_campaign: sanitize(typeof obj.utm_campaign === 'string' ? obj.utm_campaign : null, 200),
    utm_term: sanitize(typeof obj.utm_term === 'string' ? obj.utm_term : null, 200),
    utm_content: sanitize(typeof obj.utm_content === 'string' ? obj.utm_content : null, 200),
    gclid: sanitize(typeof obj.gclid === 'string' ? obj.gclid : null, 200),
    fbclid: sanitize(typeof obj.fbclid === 'string' ? obj.fbclid : null, 200),
    msclkid: sanitize(typeof obj.msclkid === 'string' ? obj.msclkid : null, 200),
  }
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
    const submission = sanitize(body.submission, 8000)
    const utm_source = sanitize(body.utm_source, 200)
    const utm_medium = sanitize(body.utm_medium, 200)
    const utm_campaign = sanitize(body.utm_campaign, 200)
    const utm_term = sanitize(body.utm_term, 200)
    const utm_content = sanitize(body.utm_content, 200)
    const gclid = sanitize(body.gclid, 200)
    const fbclid = sanitize(body.fbclid, 200)
    const msclkid = sanitize(body.msclkid, 200)
    const first_seen_attribution = sanitizeAttributionObject(body.first_seen_attribution)
    const last_seen_attribution = sanitizeAttributionObject(body.last_seen_attribution)

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
      submission,
      status: 'new',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      gclid,
      fbclid,
      msclkid,
      first_seen_attribution,
      last_seen_attribution,
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to store lead.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
