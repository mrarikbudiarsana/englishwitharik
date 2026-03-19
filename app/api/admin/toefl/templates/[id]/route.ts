import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

function validateTemplateShape(templateId: string, value: unknown) {
  if (!value || typeof value !== 'object') {
    throw new Error('Template JSON must be an object.')
  }

  const data = value as Record<string, unknown>

  if ('type' in data && 'test' in data) {
    throw new Error('Save only the inner test object. Remove the outer "type" and "test" wrapper before saving.')
  }

  if (typeof data.title !== 'string' || typeof data.durationMinutes !== 'number') {
    throw new Error('Template must include "title" and numeric "durationMinutes".')
  }

  if (templateId === 'listening') {
    const parts = data.parts as Record<string, unknown> | undefined
    if (!parts?.A || !parts?.B || !parts?.C) {
      throw new Error('Listening template must include parts A, B, and C.')
    }
  }

  if (templateId === 'structure') {
    const parts = data.parts as Record<string, unknown> | undefined
    if (!parts?.A || !parts?.B) {
      throw new Error('Structure template must include parts A and B.')
    }
  }

  if (templateId === 'reading' && !Array.isArray(data.passages)) {
    throw new Error('Reading template must include a passages array.')
  }
}

async function authorize() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_admin')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && !profile.is_admin)) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { error: null }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await authorize()
  if (authError) return authError

  const { id } = await params
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('toefl_templates')
    .select('id, type, test_data, updated_at')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to load template' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await authorize()
  if (authError) return authError

  const { id } = await params

  try {
    const body = await request.json() as { testData: unknown }
    validateTemplateShape(id, body.testData)

    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('toefl_templates')
      .update({
        test_data: body.testData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('TOEFL template update error:', error)
      return NextResponse.json({ error: 'Failed to save template' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
