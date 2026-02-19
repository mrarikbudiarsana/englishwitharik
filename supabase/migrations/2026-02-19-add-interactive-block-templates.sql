-- Shared interactive block templates for blog editor

CREATE TABLE IF NOT EXISTS interactive_block_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  block_type text NOT NULL,
  shortcode text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE TRIGGER interactive_block_templates_updated_at
BEFORE UPDATE ON interactive_block_templates
FOR EACH ROW
EXECUTE FUNCTION update_blog_updated_at();

ALTER TABLE interactive_block_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interactive_templates_admin_read" ON interactive_block_templates;
DROP POLICY IF EXISTS "interactive_templates_admin_write" ON interactive_block_templates;
DROP POLICY IF EXISTS "interactive_templates_admin_insert" ON interactive_block_templates;

CREATE POLICY "interactive_templates_admin_read"
ON interactive_block_templates
FOR SELECT
USING (is_blog_admin());

CREATE POLICY "interactive_templates_admin_write"
ON interactive_block_templates
USING (is_blog_admin());

CREATE POLICY "interactive_templates_admin_insert"
ON interactive_block_templates
FOR INSERT
WITH CHECK (is_blog_admin());

CREATE INDEX IF NOT EXISTS idx_interactive_templates_block_type
ON interactive_block_templates(block_type);

CREATE INDEX IF NOT EXISTS idx_interactive_templates_created_at
ON interactive_block_templates(created_at DESC);
