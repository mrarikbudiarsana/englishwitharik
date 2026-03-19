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
