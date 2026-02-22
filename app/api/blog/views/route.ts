import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function sanitize(input: unknown, maxLength = 200): string | null {
  if (typeof input !== 'string') return null
  const value = input.trim()
  if (!value) return null
  return value.slice(0, maxLength)
}

function sanitizeAttributionObject(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const obj = input as Record<string, unknown>
  return {
    utm_source: sanitize(obj.utm_source),
    utm_medium: sanitize(obj.utm_medium),
    utm_campaign: sanitize(obj.utm_campaign),
    utm_term: sanitize(obj.utm_term),
    utm_content: sanitize(obj.utm_content),
    gclid: sanitize(obj.gclid),
    fbclid: sanitize(obj.fbclid),
    msclkid: sanitize(obj.msclkid),
  }
}

// POST — record a page view (called client-side on post pages)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const path = sanitize(body.path, 500)
    const post_id = sanitize(body.post_id, 64)
    const session_id = sanitize(body.session_id, 120)
    const clientReferrer = sanitize(body.referrer, 1000)
    const utm_source = sanitize(body.utm_source)
    const utm_medium = sanitize(body.utm_medium)
    const utm_campaign = sanitize(body.utm_campaign)
    const utm_term = sanitize(body.utm_term)
    const utm_content = sanitize(body.utm_content)
    const gclid = sanitize(body.gclid)
    const fbclid = sanitize(body.fbclid)
    const msclkid = sanitize(body.msclkid)
    const first_seen_attribution = sanitizeAttributionObject(body.first_seen_attribution)
    const last_seen_attribution = sanitizeAttributionObject(body.last_seen_attribution)

    if (!path) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const country = req.headers.get('x-vercel-ip-country') ?? null
    const city = req.headers.get('x-vercel-ip-city') ?? null
    const referrer = clientReferrer ?? req.headers.get('referer') ?? null
    const ua = req.headers.get('user-agent') ?? ''
    // Detect device type: tablet first (iPad, Android tablet), then mobile, then desktop
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua)
    const isMobile = /mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)
    const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

    await supabase.from('page_views').insert({
      path,
      post_id: post_id ?? null,
      country,
      city,
      referrer,
      device,
      session_id: session_id ?? null,
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
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
