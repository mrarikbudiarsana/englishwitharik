import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_STATUS = new Set(['new', 'contacted', 'closed'])

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

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { ok, supabase } = await checkAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  const { status } = await req.json() as { status?: string }

  if (!status || !ALLOWED_STATUS.has(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
