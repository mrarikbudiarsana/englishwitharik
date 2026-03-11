import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkData() {
  const { data, error } = await supabase
    .from('toefl_templates')
    .select('*')
    .eq('id', 'listening')
    .single()

  if (error) {
    console.error('Error:', error.message)
    return
  }

  console.log('ID:', data.id)
  console.log('Type:', data.type)
  const jsonStr = JSON.stringify(data.test_data, null, 2)
  console.log('JSON Length:', jsonStr.length)
  console.log('JSON Preview (first 200 chars):')
  console.log(jsonStr.substring(0, 200))
  console.log('JSON Preview (last 100 chars):')
  console.log(jsonStr.substring(jsonStr.length - 100))
}

checkData()
