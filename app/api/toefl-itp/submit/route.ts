import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { TOEFLTestTemplate, TOEFLListeningTest, TOEFLStructureTest, TOEFLReadingTest } from '@/lib/toefl/types'

function calculateScore(answers: Record<string, number>, template: TOEFLTestTemplate) {
  let score = 0
  let total = 0

  if (template.type === 'listening') {
    const listeningTest = template.test as TOEFLListeningTest
    // Score Part A
    listeningTest.parts.A.questions.forEach(q => {
      total++
      if (answers[q.id] === q.correctAnswerIndex) score++
    })
    // Score Part B
    listeningTest.parts.B.passages.forEach(p => {
      p.questions.forEach(q => {
        total++
        if (answers[q.id] === q.correctAnswerIndex) score++
      })
    })
    // Score Part C
    listeningTest.parts.C.passages.forEach(p => {
      p.questions.forEach(q => {
        total++
        if (answers[q.id] === q.correctAnswerIndex) score++
      })
    })
  } else if (template.type === 'structure') {
    const structureTest = template.test as TOEFLStructureTest
     structureTest.parts.A.questions.forEach(q => {
      total++
      if (answers[q.id] === q.correctAnswerIndex) score++
    })
    structureTest.parts.B.questions.forEach(q => {
      total++
      if (answers[q.id] === q.correctAnswerIndex) score++
    })
  } else if (template.type === 'reading') {
    const readingTest = template.test as TOEFLReadingTest
    readingTest.passages.forEach(p => {
      p.questions.forEach(q => {
        total++
        if (answers[q.id] === q.correctAnswerIndex) score++
      })
    })
  }

  return { score, total }
}

export async function POST(request: Request) {
  try {
    const { attemptId, answers, section } = await request.json()

    if (!attemptId || !section || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Fetch the dynamic template from DB to judge the score
    const { data: templateRecord, error: templateError } = await supabase
      .from('toefl_templates')
      .select('test_data')
      .eq('id', section)
      .single()

    if (templateError || !templateRecord) {
      console.error('Error fetching template for scoring:', templateError)
      return NextResponse.json({ error: 'Test template not found in database' }, { status: 404 })
    }

    const templateData = {
      type: section,
      test: templateRecord.test_data
    } as any

    // Server-side scoring
    const { score, total } = calculateScore(answers, templateData)

    // Update attempt
    const { error } = await supabase
      .from('toefl_attempts')
      .update({
        answers,
        score,
        total,
        completed_at: new Date().toISOString()
      })
      .eq('id', attemptId)

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
