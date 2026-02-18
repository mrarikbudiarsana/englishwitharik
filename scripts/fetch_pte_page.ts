
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load env
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local not found.')
        process.exit(1)
    }
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const [key, ...rest] = trimmed.split('=')
        if (key && rest) process.env[key.trim()] = rest.join('=').trim()
    }
}
loadEnv()

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
    const { data: page, error } = await supabase
        .from('blog_pages')
        .select('*')
        .eq('id', 'e6577bad-0157-4a15-8dd7-49c5526c3feb')
        .single()

    if (error) {
        console.error('Error fetching page:', error)
        return
    }

    fs.writeFileSync('temp_page_content.json', JSON.stringify(page, null, 2))
    console.log('Page content saved to temp_page_content.json')
}

main()
