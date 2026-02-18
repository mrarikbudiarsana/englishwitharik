export type PostStatus = 'draft' | 'published'

export interface Post {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  status: PostStatus
  featured_image_url: string | null
  seo_title: string | null
  seo_description: string | null
  author_id: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  // Joined
  categories?: Category[]
  tags?: Tag[]
}

export interface BlogPage {
  id: string
  title: string
  slug: string
  content: string | null
  status: PostStatus
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string | null
  post_count?: number
}

export interface Tag {
  id: string
  name: string
  slug: string
  post_count?: number
}

export interface MediaItem {
  id: string
  public_id: string
  url: string
  alt_text: string | null
  width: number | null
  height: number | null
  format: string | null
  bytes: number | null
  folder: string
  uploaded_at: string
}

export interface PageView {
  id: number
  path: string
  post_id: string | null
  viewed_at: string
  country: string | null
  referrer: string | null
}

export interface SiteSettings {
  site_title: string
  site_description: string
  whatsapp: string
  email: string
  instagram: string
  youtube: string
  hero_title: string
  hero_subtitle: string
}
