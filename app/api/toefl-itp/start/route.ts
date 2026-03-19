import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isTOEFLSection } from '@/lib/toefl/catalog'

export async function POST(request: Request) {
  try {
    const { name, email, userId, section, testSetSlug } = await request.json()

    if (!name || !email || !userId || !section || !testSetSlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!isTOEFLSection(section)) {
      return NextResponse.json({ error: 'Invalid TOEFL section' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: testSet, error: testSetError } = await supabase
      .from('toefl_test_sets')
      .select('id, slug')
      .eq('slug', testSetSlug)
      .eq('is_published', true)
      .single()

    if (testSetError || !testSet) {
      return NextResponse.json({ error: `Invalid test set: ${testSetSlug}` }, { status: 404 })
    }

    const { data: templateExists, error: templateCheckError } = await supabase
      .from('toefl_test_set_sections')
      .select('id')
      .eq('test_set_id', testSet.id)
      .eq('section', section)
      .eq('is_enabled', true)
      .single()

    if (templateCheckError || !templateExists) {
      return NextResponse.json({ error: `Invalid test section: ${section}` }, { status: 404 })
    }

    let participantId: string

    const { data: existingParticipant, error: fetchError } = await supabase
      .from('toefl_participants')
      .select('id')
      .eq('email', email)
      .limit(1)
      .maybeSingle()

    if (fetchError) {
      console.error('Participant fetch error:', fetchError)
      return NextResponse.json({ error: 'Database error', details: fetchError }, { status: 500 })
    }

    if (existingParticipant) {
      participantId = existingParticipant.id
      await supabase
        .from('toefl_participants')
        .update({ name, user_id: userId })
        .eq('id', participantId)
    } else {
      const { data: newParticipant, error: insertError } = await supabase
        .from('toefl_participants')
        .insert([{ name, email, user_id: userId }])
        .select()
        .single()

      if (insertError) {
        console.error('Participant insert error:', insertError)
        return NextResponse.json({ error: 'Failed to register participant', details: insertError }, { status: 500 })
      }

      participantId = newParticipant.id
    }

    const { data: existingAttempt, error: attemptFetchError } = await supabase
      .from('toefl_attempts')
      .select('id')
      .eq('participant_id', participantId)
      .eq('test_set_id', testSet.id)
      .eq('section', section)
      .is('completed_at', null)
      .limit(1)
      .maybeSingle()

    if (attemptFetchError) {
      console.error('Attempt fetch error:', attemptFetchError)
    }

    if (existingAttempt) {
      return NextResponse.json({ attemptId: existingAttempt.id })
    }

    const { data: newAttempt, error: attemptError } = await supabase
      .from('toefl_attempts')
      .insert([
        {
          participant_id: participantId,
          test_set_id: testSet.id,
          section,
          answers: {},
        }
      ])
      .select()
      .single()

    if (attemptError) {
      console.error('Attempt insert error:', attemptError)
      return NextResponse.json({ error: 'Failed to start test attempt', details: attemptError }, { status: 500 })
    }

    return NextResponse.json({ attemptId: newAttempt.id })
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error)
    console.error('Test Start Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred', details },
      { status: 500 }
    )
  }
}
