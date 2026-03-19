import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { calculateScore, isTOEFLSection, toTemplate } from '@/lib/toefl/catalog'

export async function POST(request: Request) {
  try {
    const { attemptId, answers } = await request.json()

    if (!attemptId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: attempt, error: attemptError } = await supabase
      .from('toefl_attempts')
      .select('id, test_set_id, section')
      .eq('id', attemptId)
      .single()

    if (attemptError || !attempt || !isTOEFLSection(attempt.section)) {
      console.error('Error fetching attempt for submit:', attemptError)
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    const { data: templateRecord, error: templateError } = await supabase
      .from('toefl_test_set_sections')
      .select('test_data')
      .eq('test_set_id', attempt.test_set_id)
      .eq('section', attempt.section)
      .eq('is_enabled', true)
      .single()

    if (templateError || !templateRecord) {
      console.error('Error fetching template for scoring:', templateError)
      return NextResponse.json({ error: 'Test template not found in database' }, { status: 404 })
    }

    const templateData = toTemplate(attempt.section, templateRecord.test_data)

    if (!templateData) {
      return NextResponse.json({ error: 'Stored test template is invalid' }, { status: 500 })
    }

    const { score, total } = calculateScore(answers, templateData)

    const { error } = await supabase
      .from('toefl_attempts')
      .update({
        answers,
        score,
        total,
        completed_at: new Date().toISOString()
      })
      .eq('id', attempt.id)

    if (error) {
      console.error('Submit error:', error)
      return NextResponse.json({ error: 'Failed to record submit' }, { status: 500 })
    }

    return NextResponse.json({ success: true, score, total })
  } catch (error) {
    console.error('Submit Error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
