import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST — record a page view (called client-side on post pages)
export async function POST(req: NextRequest) {
  try {
    const { path, post_id, session_id } = await req.json()
    const supabase = await createAdminClient()
    const country = req.headers.get('x-vercel-ip-country') ?? null
    const city = req.headers.get('x-vercel-ip-city') ?? null
    const referrer = req.headers.get('referer') ?? null
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
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
