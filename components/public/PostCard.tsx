import Link from 'next/link'
import Image from 'next/image'
import type { Post, Category } from '@/lib/types'

interface PostCardProps {
  post: Post & { categories?: Category[] }
}

export default function PostCard({ post }: PostCardProps) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Link href={`/blog/${post.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#08507f]/30 hover:shadow-md transition-all">
      {post.featured_image_url ? (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-gradient-to-br from-[#08507f]/5 to-[#08507f]/10 flex items-center justify-center">
          <span className="text-4xl">📚</span>
        </div>
      )}

      <div className="p-5">
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {post.categories.slice(0, 2).map(cat => (
              <span key={cat.id} className="text-xs text-[#08507f] bg-[#08507f]/10 px-2 py-0.5 rounded-full font-medium">
                {cat.name}
              </span>
            ))}
          </div>
        )}

        <h2 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#08507f] transition-colors line-clamp-2 mb-2">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
            {post.excerpt}
          </p>
        )}

        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </Link>
  )
}
