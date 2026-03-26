import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import listeningTemplate from './data/listening-template.json'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function main() {
  const payload =
    listeningTemplate && typeof listeningTemplate === 'object' && 'test' in listeningTemplate
      ? listeningTemplate.test
      : listeningTemplate

  const { error } = await supabase
    .from('toefl_templates')
    .update({
      test_data: payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'listening')

  if (error) {
    console.error('Failed to update listening template:', error.message)
    process.exit(1)
  }

  const { data: targetSets, error: setLookupError } = await supabase
    .from('toefl_test_sets')
    .select('id, slug')
    .in('slug', ['practice-test-1', 'default'])

  if (setLookupError) {
    console.error('Failed to look up target test sets:', setLookupError.message)
    process.exit(1)
  }

  if (targetSets && targetSets.length > 0) {
    const targetSetIds = targetSets.map((set) => set.id)

    const { error: sectionUpdateError } = await supabase
      .from('toefl_test_set_sections')
      .update({
        test_data: payload,
        updated_at: new Date().toISOString(),
      })
      .eq('section', 'listening')
      .in('test_set_id', targetSetIds)

    if (sectionUpdateError) {
      console.error('Failed to update listening section for target test sets:', sectionUpdateError.message)
      process.exit(1)
    }

    console.log(`Updated listening test-set sections for slugs: ${targetSets.map((set) => set.slug).join(', ')}`)
  } else {
    console.log('No target test sets found for slugs: practice-test-1, default')
  }

  const testData = payload as {
    parts: {
      A: { questions: unknown[] }
      B: { passages: Array<{ questions: unknown[] }> }
      C: { passages: Array<{ questions: unknown[] }> }
    }
  }

  const partACount = testData.parts.A.questions.length
  const partBCount = testData.parts.B.passages.reduce((count, passage) => count + passage.questions.length, 0)
  const partCCount = testData.parts.C.passages.reduce((count, passage) => count + passage.questions.length, 0)

  console.log(`Updated listening template: A=${partACount}, B=${partBCount}, C=${partCCount}, total=${partACount + partBCount + partCCount}`)
}

main()
