-- Add workflow status for lead management

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new'
CHECK (status IN ('new', 'contacted', 'closed'));

DROP POLICY IF EXISTS "leads_admin_update" ON leads;
CREATE POLICY "leads_admin_update" ON leads FOR UPDATE USING (is_blog_admin());

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
