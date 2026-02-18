/**
 * WordPress XML → Supabase + Cloudinary Migration Script
 *
 * Usage:
 *   npx ts-node --esm scripts/import-wordpress.ts
 *   OR
 *   npx tsx scripts/import-wordpress.ts
 *
 * Requirements:
 *   - .env.local must have SUPABASE keys and CLOUDINARY keys
 *   - Run AFTER applying the Supabase migration SQL
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'

// ---------------------------------------------------------------------------
// 1. Load env
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found. Create it from .env.local.example first.')
    process.exit(1)
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    process.env[key.trim()] = rest.join('=').trim()
  }
}
loadEnv()

// ---------------------------------------------------------------------------
// 2. Clients
// ---------------------------------------------------------------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

const BLOG_FOLDER  = 'englishwitharik/blog'
const WP_XML_PATH  = path.join(
  process.env.USERPROFILE ?? process.env.HOME ?? '',
  'Downloads',
  'englishwitharik.WordPress.2026-02-17.xml'
)

// ---------------------------------------------------------------------------
// 3. Simple XML parser helpers
// ---------------------------------------------------------------------------
function extractAll(xml: string, tag: string): string[] {
  const results: string[] = []
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) results.push(m[1])
  return results
}

function extractOne(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`)
  return xml.match(re)?.[1]?.trim() ?? ''
}

function decodeCDATA(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, inner) => inner).trim()
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 200)
}

// ---------------------------------------------------------------------------
// 4. Download image and upload to Cloudinary
// ---------------------------------------------------------------------------
async function uploadImageToCloudinary(imageUrl: string, publicIdBase: string): Promise<string | null> {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: BLOG_FOLDER,
      public_id: publicIdBase.replace(/[^a-z0-9-_]/g, '-').slice(0, 100),
      overwrite: false,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    })
    return result.secure_url
  } catch (err) {
    console.warn(`  ⚠️  Could not upload image ${imageUrl}:`, (err as Error).message)
    return null
  }
}

// ---------------------------------------------------------------------------
// 5. Replace WP image URLs in content with Cloudinary URLs
// ---------------------------------------------------------------------------
async function rewriteContentImages(
  content: string,
  imageMap: Map<string, string>
): Promise<string> {
  let result = content
  for (const [wpUrl, cdnUrl] of imageMap) {
    result = result.split(wpUrl).join(cdnUrl)
  }
  return result
}

// ---------------------------------------------------------------------------
// 6. Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('\n🚀 Starting WordPress → Next.js migration\n')

  if (!fs.existsSync(WP_XML_PATH)) {
    console.error(`❌ WordPress XML not found at: ${WP_XML_PATH}`)
    console.error('   Place the XML file in your Downloads folder and try again.')
    process.exit(1)
  }

  const xml = fs.readFileSync(WP_XML_PATH, 'utf-8')
  console.log(`📄 Loaded XML: ${(xml.length / 1024).toFixed(0)} KB\n`)

  // ---- CATEGORIES ----
  console.log('📂 Migrating categories…')
  const catBlocks = extractAll(xml, 'wp:category')
  const categorySlugToId = new Map<string, string>()

  // First pass: root categories (no parent)
  for (const block of catBlocks) {
    const name   = decodeCDATA(extractOne(block, 'wp:cat_name'))
    const slug   = decodeCDATA(extractOne(block, 'wp:category_nicename'))
    const parent = decodeCDATA(extractOne(block, 'wp:category_parent'))
    if (!slug || parent) continue

    const { data } = await supabase
      .from('categories')
      .upsert({ name, slug }, { onConflict: 'slug' })
      .select('id')
      .single()

    if (data?.id) categorySlugToId.set(slug, data.id)
  }

  // Second pass: child categories
  for (const block of catBlocks) {
    const name       = decodeCDATA(extractOne(block, 'wp:cat_name'))
    const slug       = decodeCDATA(extractOne(block, 'wp:category_nicename'))
    const parentSlug = decodeCDATA(extractOne(block, 'wp:category_parent'))
    if (!slug || !parentSlug) continue

    const parentId = categorySlugToId.get(parentSlug) ?? null
    const { data } = await supabase
      .from('categories')
      .upsert({ name, slug, parent_id: parentId }, { onConflict: 'slug' })
      .select('id')
      .single()

    if (data?.id) categorySlugToId.set(slug, data.id)
  }
  console.log(`  ✅ ${categorySlugToId.size} categories imported\n`)

  // ---- TAGS ----
  console.log('🏷️  Migrating tags…')
  const tagBlocks = extractAll(xml, 'wp:tag')
  const tagSlugToId = new Map<string, string>()

  for (const block of tagBlocks) {
    const name = decodeCDATA(extractOne(block, 'wp:tag_name'))
    const slug = decodeCDATA(extractOne(block, 'wp:tag_slug'))
    if (!slug) continue

    const { data } = await supabase
      .from('tags')
      .upsert({ name, slug }, { onConflict: 'slug' })
      .select('id')
      .single()

    if (data?.id) tagSlugToId.set(slug, data.id)
  }
  console.log(`  ✅ ${tagSlugToId.size} tags imported\n`)

  // ---- ITEMS (posts + pages) ----
  const items = extractAll(xml, 'item')
  console.log(`📝 Found ${items.length} items (posts + pages + attachments)\n`)

  // Build attachment ID → URL map (wp:post_id → wp:attachment_url)
  console.log('🖼️  Collecting attachment URLs…')
  const attachmentUrlMap = new Map<string, string>() // original WP URL → Cloudinary URL
  const attachmentIdToUrl = new Map<string, string>() // wp:post_id → wp:attachment_url
  const attachmentItems = items.filter(item => decodeCDATA(extractOne(item, 'wp:post_type')) === 'attachment')
  for (const item of attachmentItems) {
    const postId = decodeCDATA(extractOne(item, 'wp:post_id'))
    const url    = decodeCDATA(extractOne(item, 'wp:attachment_url'))
    if (postId && url) attachmentIdToUrl.set(postId, url)
  }
  console.log(`   ${attachmentItems.length} attachments found (${attachmentIdToUrl.size} with URLs)\n`)

  // ---- PAGES ----
  console.log('📄 Migrating pages…')
  let pageCount = 0
  const pageItems = items.filter(item => decodeCDATA(extractOne(item, 'wp:post_type')) === 'page')

  for (const item of pageItems) {
    const title   = decodeCDATA(extractOne(item, 'title'))
    const slug    = decodeCDATA(extractOne(item, 'wp:post_name'))
    const status  = decodeCDATA(extractOne(item, 'wp:status')) === 'publish' ? 'published' : 'draft'
    const content = decodeCDATA(extractOne(item, 'content:encoded'))
    if (!slug) continue

    await supabase
      .from('blog_pages')
      .upsert({ title, slug, content, status }, { onConflict: 'slug' })

    pageCount++
    console.log(`  ✅ Page: ${title}`)
  }
  console.log(`\n  Total: ${pageCount} pages imported\n`)

  // ---- POSTS ----
  console.log('✍️  Migrating posts…')
  let postCount = 0
  const postItems = items.filter(item => decodeCDATA(extractOne(item, 'wp:post_type')) === 'post')

  for (const item of postItems) {
    const title      = decodeCDATA(extractOne(item, 'title'))
    const slug       = decodeCDATA(extractOne(item, 'wp:post_name')) || generateSlug(title)
    const status     = decodeCDATA(extractOne(item, 'wp:status')) === 'publish' ? 'published' : 'draft'
    const pubDateStr = decodeCDATA(extractOne(item, 'wp:post_date'))
    const publishedAt = pubDateStr ? new Date(pubDateStr).toISOString() : null
    let   content    = decodeCDATA(extractOne(item, 'content:encoded'))
    const excerpt    = decodeCDATA(extractOne(item, 'excerpt:encoded'))

    // Featured image: resolve _thumbnail_id → attachment URL → Cloudinary
    const metaBlocks = extractAll(item, 'wp:postmeta')
    let featuredImageUrl: string | null = null
    for (const meta of metaBlocks) {
      const key   = decodeCDATA(extractOne(meta, 'wp:meta_key'))
      const value = decodeCDATA(extractOne(meta, 'wp:meta_value'))
      if (key === '_thumbnail_id' && value) {
        const wpUrl = attachmentIdToUrl.get(value)
        if (wpUrl) {
          if (attachmentUrlMap.has(wpUrl)) {
            featuredImageUrl = attachmentUrlMap.get(wpUrl)!
          } else {
            const cdnUrl = await uploadImageToCloudinary(wpUrl, slug + '-featured')
            featuredImageUrl = cdnUrl
            if (cdnUrl) attachmentUrlMap.set(wpUrl, cdnUrl)
          }
        }
      }
    }

    // Upload inline images from content
    const imgUrlsInContent = [...content.matchAll(/https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp)/gi)].map(m => m[0])
    for (const imgUrl of imgUrlsInContent) {
      if (!attachmentUrlMap.has(imgUrl)) {
        const cdnUrl = await uploadImageToCloudinary(imgUrl, slug + '-img-' + Math.random().toString(36).slice(2, 7))
        if (cdnUrl) attachmentUrlMap.set(imgUrl, cdnUrl)
      }
    }

    // Rewrite content image URLs
    content = await rewriteContentImages(content, attachmentUrlMap)

    // Get categories and tags for this post (use nicename attribute = slug)
    const categoryTags = (item.match(/<category[^>]*>[\s\S]*?<\/category>/g) ?? [])
    const catSlugs = categoryTags
      .filter(c => /domain="category"/.test(c))
      .map(c => c.match(/nicename="([^"]+)"/)?.[1] ?? '')
      .filter(Boolean)

    const tagSlugs = categoryTags
      .filter(c => /domain="post_tag"/.test(c))
      .map(c => c.match(/nicename="([^"]+)"/)?.[1] ?? '')
      .filter(Boolean)

    if (!title || !slug) continue

    // Upsert post
    const { data: post, error } = await supabase
      .from('posts')
      .upsert({
        title,
        slug,
        content,
        excerpt: excerpt || null,
        status,
        featured_image_url: featuredImageUrl,
        published_at: publishedAt,
      }, { onConflict: 'slug' })
      .select('id')
      .single()

    if (error) { console.warn(`  ⚠️  Error upserting "${title}":`, error.message); continue }

    // Link categories
    for (const catSlug of catSlugs) {
      const catId = categorySlugToId.get(catSlug)
      if (catId && post?.id) {
        await supabase.from('post_categories')
          .upsert({ post_id: post.id, category_id: catId }, { onConflict: 'post_id,category_id' })
      }
    }

    // Link tags
    for (const tagSlug of tagSlugs) {
      const tagId = tagSlugToId.get(tagSlug)
      if (tagId && post?.id) {
        await supabase.from('post_tags')
          .upsert({ post_id: post.id, tag_id: tagId }, { onConflict: 'post_id,tag_id' })
      }
    }

    postCount++
    console.log(`  ✅ [${status}] ${title}`)
  }

  console.log('\n' + '─'.repeat(60))
  console.log(`🎉 Migration complete!`)
  console.log(`   📄 Pages:     ${pageCount}`)
  console.log(`   ✍️  Posts:     ${postCount}`)
  console.log(`   🖼️  Images:   ${attachmentUrlMap.size} uploaded to Cloudinary`)
  console.log(`   📂 Folder:   ${BLOG_FOLDER}`)
  console.log('─'.repeat(60) + '\n')
}

main().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
