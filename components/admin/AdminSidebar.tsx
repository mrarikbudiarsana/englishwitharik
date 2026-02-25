'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  FileText,
  Image,
  Tag,
  Settings,
  LogOut,
  Globe,
  PenSquare,
  BarChart2,
  Layers,
  Inbox,
  Star,
  Share2,
  DollarSign,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/stats', label: 'Stats', icon: BarChart2 },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/pages', label: 'Pages', icon: Layers },
  { href: '/admin/leads', label: 'Leads', icon: Inbox },
  { href: '/admin/ratings', label: 'Ratings', icon: Star },
  { href: '/admin/share-links', label: 'Share Links', icon: Share2 },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-60 h-screen sticky top-0 flex-shrink-0 overflow-hidden bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <Link href="/" target="_blank" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#08507f] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">English with Arik</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 group-hover:text-[#08507f] transition-colors">
              <Globe size={10} /> View site
            </p>
          </div>
        </Link>
      </div>

      {/* New Post shortcut */}
      <div className="px-4 pt-4">
        <Link
          href="/admin/posts/new"
          className="flex items-center justify-center gap-2 bg-[#08507f] hover:bg-[#063a5c] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors w-full"
        >
          <PenSquare size={15} />
          New Post
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active
                ? 'bg-gray-700 text-white font-medium'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
