import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdminJson } from '@/lib/admin/auth'
import { isTOEFLSection } from '@/lib/toefl/catalog'

function validateTemplateShape(section: string, value: unknown) {
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

  if (section === 'listening') {
    const parts = data.parts as Record<string, unknown> | undefined
    if (!parts?.A || !parts?.B || !parts?.C) {
      throw new Error('Listening template must include parts A, B, and C.')
    }
  }

  if (section === 'structure') {
    const parts = data.parts as Record<string, unknown> | undefined
    if (!parts?.A || !parts?.B) {
      throw new Error('Structure template must include parts A and B.')
    }
  }

  if (section === 'reading' && !Array.isArray(data.passages)) {
    throw new Error('Reading template must include a passages array.')
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; section: string }> },
) {
  const { error: authError } = await requireAdminJson()
  if (authError) return authError

  const { id, section } = await params
  if (!isTOEFLSection(section)) {
    return NextResponse.json({ error: 'Invalid section.' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('toefl_test_set_sections')
    .select('*')
    .eq('test_set_id', id)
    .eq('section', section)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to load section.' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; section: string }> },
) {
  const { error: authError } = await requireAdminJson()
  if (authError) return authError

  const { id, section } = await params
  if (!isTOEFLSection(section)) {
    return NextResponse.json({ error: 'Invalid section.' }, { status: 400 })
  }

  try {
    const body = await request.json() as {
      title?: string
      description?: string
      sort_order?: number
      is_enabled?: boolean
      testData: unknown
    }

    validateTemplateShape(section, body.testData)

    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('toefl_test_set_sections')
      .upsert({
        test_set_id: id,
        section,
        title: body.title || `${section[0].toUpperCase()}${section.slice(1)} Test`,
        description: body.description ?? '',
        sort_order: body.sort_order ?? 0,
        is_enabled: body.is_enabled ?? true,
        test_data: body.testData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'test_set_id,section' })

    if (error) {
      console.error('TOEFL section upsert error:', error)
      return NextResponse.json({ error: 'Failed to save section.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
