import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { toeflTemplate } from '../lib/toefl/templates'
import * as path from 'path'

// Load environment variables from .env.local strictly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function migrateTemplates() {
  console.log('Checking information_schema for table existence...')
  
  // Try to query pg_tables (requires service_role)
  const { error: tableError } = await supabase
    .from('toefl_participants') // Checking a known table
    .select('count')
    .limit(1)

  console.log('Participant check:', tableError ? tableError.message : 'OK')

  for (const [id, template] of Object.entries(toeflTemplate)) {
    console.log(`Migrating template: ${id}...`)

    const { error } = await supabase
      .from('toefl_templates')
      .upsert({
        id: id,
        type: template.type,
        test_data: template.test,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (error) {
      console.error(`Failed to migrate template ${id}:`, error.message)
    } else {
      console.log(`Successfully migrated template: ${id}`)
    }
  }

  console.log('Migration complete.')
}

migrateTemplates()
