import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { name, email, section } = await request.json()

    if (!name || !email || !section) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    // 0. Verify the test section exists in templates
    const { data: templateExists, error: templateCheckError } = await supabase
      .from('toefl_templates')
      .select('id')
      .eq('id', section)
      .single()

    if (templateCheckError || !templateExists) {
      return NextResponse.json({ error: `Invalid test section: ${section}` }, { status: 404 })
    }

    // 1. Find or create the participant
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
      // Optional: Update name if it changed
      if (name) {
        await supabase
          .from('toefl_participants')
          .update({ name })
          .eq('id', participantId)
      }
    } else {
      const { data: newParticipant, error: insertError } = await supabase
        .from('toefl_participants')
        .insert([{ name, email }])
        .select()
        .single()

      if (insertError) {
        console.error('Participant insert error:', insertError)
        return NextResponse.json({ error: 'Failed to register participant', details: insertError }, { status: 500 })
      }
      participantId = newParticipant.id
    }

    // 2. Check if they already have an uncompleted attempt for this section
    const { data: existingAttempt, error: attemptFetchError } = await supabase
      .from('toefl_attempts')
      .select('id')
      .eq('participant_id', participantId)
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

    // 3. Create a new attempt
    const { data: newAttempt, error: attemptError } = await supabase
      .from('toefl_attempts')
      .insert([
        {
          participant_id: participantId,
          section,
          answers: {} // Initialize empty answers JSON
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
