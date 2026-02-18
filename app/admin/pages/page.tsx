import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Plus } from 'lucide-react'

export default async function AdminPagesPage() {
  const supabase = await createClient()
  const { data: pages } = await supabase
    .from('blog_pages')
    .select('id, title, slug, status, created_at, updated_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pages?.length ?? 0} pages</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 bg-[#08507f] hover:bg-[#063a5c] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Page
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {!pages?.length ? (
          <div className="py-20 text-center">
            <FileText size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No pages yet.</p>
            <Link href="/admin/pages/new" className="text-[#08507f] text-sm hover:underline mt-1 inline-block">
              Create your first page →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Title</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Last Updated</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map(page => (
                <tr key={page.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-3">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="font-medium text-gray-800 hover:text-[#08507f] group-hover:text-[#08507f]"
                    >
                      {page.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">/{page.slug}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      page.status === 'published'
                        ? 'bg-[#08507f]/10 text-[#08507f]'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {new Date(page.updated_at ?? page.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/pages/${page.id}`} className="text-[#08507f] hover:underline text-xs">
                        Edit
                      </Link>
                      <Link href={`/${page.slug}`} target="_blank" className="text-gray-400 hover:text-gray-600 text-xs">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
