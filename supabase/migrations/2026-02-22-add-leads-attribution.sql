-- Add campaign attribution fields to leads for conversion analytics

ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_term text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_content text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gclid text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fbclid text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS msclkid text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_seen_attribution jsonb;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_seen_attribution jsonb;

CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON leads(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_leads_first_attr ON leads USING GIN(first_seen_attribution);
CREATE INDEX IF NOT EXISTS idx_leads_last_attr ON leads USING GIN(last_seen_attribution);
