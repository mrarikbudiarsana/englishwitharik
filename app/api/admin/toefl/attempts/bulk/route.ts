import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_admin')
    .eq('id', user.id)
    .single()

  return { ok: Boolean(profile && (profile.role === 'admin' || profile.is_admin)) }
}

export async function DELETE(req: Request) {
  const { ok } = await checkAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await req.json().catch(() => null) as { ids?: string[] } | null
  const ids = Array.isArray(payload?.ids) ? payload.ids.filter(Boolean) : []

  if (ids.length === 0) {
    return NextResponse.json({ error: 'No attempt ids provided.' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('toefl_attempts')
    .delete()
    .in('id', ids)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete selected attempts.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, deleted: ids.length })
}
