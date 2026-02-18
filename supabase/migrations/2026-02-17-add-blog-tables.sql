-- ============================================================
-- Blog Tables for englishwitharik.id
-- Target project: scobvornehcncgsqngag (same as Portal)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Blog posts
CREATE TABLE IF NOT EXISTS posts (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text        NOT NULL,
  slug              text        UNIQUE NOT NULL,
  content           text,
  excerpt           text,
  status            text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured_image_url text,
  seo_title         text,
  seo_description   text,
  author_id         uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  published_at      timestamptz,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- Static pages (About, Pricing, IELTS prep, etc.)
CREATE TABLE IF NOT EXISTS blog_pages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  slug       text UNIQUE NOT NULL,
  content    text,
  status     text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories (hierarchical)
CREATE TABLE IF NOT EXISTS categories (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name      text NOT NULL,
  slug      text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL
);

-- Post ↔ Category junction
CREATE TABLE IF NOT EXISTS post_categories (
  post_id     uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Post ↔ Tag junction
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Media library (mirrors Cloudinary metadata)
CREATE TABLE IF NOT EXISTS media_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id   text UNIQUE NOT NULL,
  url         text NOT NULL,
  alt_text    text,
  width       integer,
  height      integer,
  format      text,
  bytes       integer,
  folder      text DEFAULT 'englishwitharik/blog',
  uploaded_at timestamptz DEFAULT now()
);

-- Page view tracking (lightweight analytics)
CREATE TABLE IF NOT EXISTS page_views (
  id        bigserial   PRIMARY KEY,
  path      text        NOT NULL,
  post_id   uuid        REFERENCES posts(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now(),
  country   text,
  referrer  text
);

-- Site settings (key/value store)
CREATE TABLE IF NOT EXISTS site_settings (
  key        text PRIMARY KEY,
  value      jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_title',       '"English with Arik"'),
  ('site_description', '"Learn English with the Best!"'),
  ('whatsapp',         '"+628214422358"'),
  ('email',            '"hello@englishwitharik.id"'),
  ('instagram',        '""'),
  ('youtube',          '""'),
  ('hero_title',       '"Learn English with Arik"'),
  ('hero_subtitle',    '"Professional IELTS, PTE, TOEFL & Business English tutoring"')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Auto-update updated_at triggers
-- ============================================================

CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE TRIGGER posts_updated_at       BEFORE UPDATE ON posts       FOR EACH ROW EXECUTE FUNCTION update_blog_updated_at();
CREATE OR REPLACE TRIGGER blog_pages_updated_at  BEFORE UPDATE ON blog_pages  FOR EACH ROW EXECUTE FUNCTION update_blog_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_pages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags           ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views     ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings  ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
-- (reuses same profiles table as Portal)
CREATE OR REPLACE FUNCTION is_blog_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (role = 'admin' OR is_admin = true)
  );
$$;

-- POSTS
DROP POLICY IF EXISTS "posts_public_read"  ON posts;
DROP POLICY IF EXISTS "posts_admin_all"    ON posts;
DROP POLICY IF EXISTS "posts_admin_insert" ON posts;
CREATE POLICY "posts_public_read"  ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "posts_admin_all"    ON posts USING (is_blog_admin());
CREATE POLICY "posts_admin_insert" ON posts FOR INSERT WITH CHECK (is_blog_admin());

-- BLOG_PAGES
DROP POLICY IF EXISTS "pages_public_read"  ON blog_pages;
DROP POLICY IF EXISTS "pages_admin_all"    ON blog_pages;
DROP POLICY IF EXISTS "pages_admin_insert" ON blog_pages;
CREATE POLICY "pages_public_read"  ON blog_pages FOR SELECT USING (status = 'published');
CREATE POLICY "pages_admin_all"    ON blog_pages USING (is_blog_admin());
CREATE POLICY "pages_admin_insert" ON blog_pages FOR INSERT WITH CHECK (is_blog_admin());

-- CATEGORIES
DROP POLICY IF EXISTS "categories_public_read"  ON categories;
DROP POLICY IF EXISTS "categories_admin_write"  ON categories;
DROP POLICY IF EXISTS "categories_admin_insert" ON categories;
CREATE POLICY "categories_public_read"  ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write"  ON categories USING (is_blog_admin());
CREATE POLICY "categories_admin_insert" ON categories FOR INSERT WITH CHECK (is_blog_admin());

-- TAGS
DROP POLICY IF EXISTS "tags_public_read"  ON tags;
DROP POLICY IF EXISTS "tags_admin_write"  ON tags;
DROP POLICY IF EXISTS "tags_admin_insert" ON tags;
CREATE POLICY "tags_public_read"  ON tags FOR SELECT USING (true);
CREATE POLICY "tags_admin_write"  ON tags USING (is_blog_admin());
CREATE POLICY "tags_admin_insert" ON tags FOR INSERT WITH CHECK (is_blog_admin());

-- JUNCTION TABLES
DROP POLICY IF EXISTS "post_categories_public_read"  ON post_categories;
DROP POLICY IF EXISTS "post_categories_admin_write"  ON post_categories;
DROP POLICY IF EXISTS "post_categories_admin_insert" ON post_categories;
CREATE POLICY "post_categories_public_read"  ON post_categories FOR SELECT USING (true);
CREATE POLICY "post_categories_admin_write"  ON post_categories USING (is_blog_admin());
CREATE POLICY "post_categories_admin_insert" ON post_categories FOR INSERT WITH CHECK (is_blog_admin());

DROP POLICY IF EXISTS "post_tags_public_read"  ON post_tags;
DROP POLICY IF EXISTS "post_tags_admin_write"  ON post_tags;
DROP POLICY IF EXISTS "post_tags_admin_insert" ON post_tags;
CREATE POLICY "post_tags_public_read"  ON post_tags FOR SELECT USING (true);
CREATE POLICY "post_tags_admin_write"  ON post_tags USING (is_blog_admin());
CREATE POLICY "post_tags_admin_insert" ON post_tags FOR INSERT WITH CHECK (is_blog_admin());

-- MEDIA
DROP POLICY IF EXISTS "media_admin_all"    ON media_items;
DROP POLICY IF EXISTS "media_admin_insert" ON media_items;
DROP POLICY IF EXISTS "media_public_read"  ON media_items;
CREATE POLICY "media_admin_all"    ON media_items USING (is_blog_admin());
CREATE POLICY "media_admin_insert" ON media_items FOR INSERT WITH CHECK (is_blog_admin());
CREATE POLICY "media_public_read"  ON media_items FOR SELECT USING (true);

-- PAGE_VIEWS
DROP POLICY IF EXISTS "pageviews_insert"     ON page_views;
DROP POLICY IF EXISTS "pageviews_admin_read" ON page_views;
CREATE POLICY "pageviews_insert"     ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "pageviews_admin_read" ON page_views FOR SELECT USING (is_blog_admin());

-- SITE_SETTINGS
DROP POLICY IF EXISTS "settings_public_read"  ON site_settings;
DROP POLICY IF EXISTS "settings_admin_write"  ON site_settings;
DROP POLICY IF EXISTS "settings_admin_insert" ON site_settings;
CREATE POLICY "settings_public_read"  ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write"  ON site_settings USING (is_blog_admin());
CREATE POLICY "settings_admin_insert" ON site_settings FOR INSERT WITH CHECK (is_blog_admin());

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_slug       ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status     ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published  ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_pageviews_path   ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_pageviews_postid ON page_views(post_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_date   ON page_views(viewed_at DESC);
