import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase.from('profiles').select('role, is_admin').eq('id', user.id).single()
  return profile && (profile.role === 'admin' || profile.is_admin)
}

export async function POST(request: NextRequest) {
  if (!await checkAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { url } = await request.json() as { url?: string }

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 })
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 })
    }

    const tinyUrlResponse = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      cache: 'no-store',
    })

    const shortUrl = (await tinyUrlResponse.text()).trim()

    if (!tinyUrlResponse.ok || !shortUrl.startsWith('http')) {
      return NextResponse.json({ error: 'Unable to shorten URL right now.' }, { status: 502 })
    }

    return NextResponse.json({ shortUrl })
  } catch {
    return NextResponse.json({ error: 'Failed to shorten URL.' }, { status: 500 })
  }
}
