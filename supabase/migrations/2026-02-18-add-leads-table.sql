-- Lead capture table for interactive CTA blocks

CREATE TABLE IF NOT EXISTS leads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text,
  whatsapp   text,
  name       text,
  source     text,
  block_id   text,
  post_id    uuid REFERENCES posts(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT leads_contact_required CHECK (email IS NOT NULL OR whatsapp IS NOT NULL)
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_public_insert" ON leads;
DROP POLICY IF EXISTS "leads_admin_read" ON leads;
CREATE POLICY "leads_public_insert" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "leads_admin_read" ON leads FOR SELECT USING (is_blog_admin());

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_post_id ON leads(post_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
