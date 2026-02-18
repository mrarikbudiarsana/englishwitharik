import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, supabase }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_admin')
    .eq('id', user.id)
    .single()

  return { ok: Boolean(profile && (profile.role === 'admin' || profile.is_admin)), supabase }
}

function escapeCsv(value: string | null | undefined) {
  const raw = value ?? ''
  if (/[",\n]/.test(raw)) return `"${raw.replaceAll('"', '""')}"`
  return raw
}

export async function GET(req: NextRequest) {
  const { ok, supabase } = await checkAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const q = url.searchParams.get('q')
  const source = url.searchParams.get('source')
  const status = url.searchParams.get('status')
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  let query = supabase
    .from('leads')
    .select(`
      id, name, email, whatsapp, source, block_id, status, created_at,
      posts(title, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(5000)

  if (source && source !== 'all') query = query.eq('source', source)
  if (status && status !== 'all') query = query.eq('status', status)
  if (from) query = query.gte('created_at', `${from}T00:00:00.000Z`)
  if (to) query = query.lte('created_at', `${to}T23:59:59.999Z`)
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,whatsapp.ilike.%${q}%,source.ilike.%${q}%`)

  const { data } = await query
  const rows = data ?? []

  const headers = ['id', 'name', 'email', 'whatsapp', 'source', 'block_id', 'status', 'post_title', 'post_slug', 'created_at']
  const lines = [headers.join(',')]

  for (const lead of rows) {
    const post = Array.isArray(lead.posts) ? lead.posts[0] : lead.posts
    lines.push([
      escapeCsv(lead.id),
      escapeCsv(lead.name),
      escapeCsv(lead.email),
      escapeCsv(lead.whatsapp),
      escapeCsv(lead.source),
      escapeCsv(lead.block_id),
      escapeCsv(lead.status),
      escapeCsv(post?.title ?? null),
      escapeCsv(post?.slug ?? null),
      escapeCsv(lead.created_at),
    ].join(','))
  }

  const csv = lines.join('\n')
  const now = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${now}.csv"`,
    },
  })
}
