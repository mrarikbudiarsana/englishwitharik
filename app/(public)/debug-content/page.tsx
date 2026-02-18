
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

export default async function DebugContentPage() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('blog_pages')
        .select('*')
        .eq('id', '1050e512-ce54-4a48-aae2-d5d7c35aa6c7')
        .single()

    if (error) {
        return <pre>{JSON.stringify(error, null, 2)}</pre>
    }

    return <pre>{JSON.stringify(data, null, 2)}</pre>
}
