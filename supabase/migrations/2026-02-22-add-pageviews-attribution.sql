-- Add campaign attribution fields to page_views

ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_term text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_content text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS gclid text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS fbclid text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS msclkid text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS first_seen_attribution jsonb;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS last_seen_attribution jsonb;

CREATE INDEX IF NOT EXISTS idx_pageviews_utm_source ON page_views(utm_source);
CREATE INDEX IF NOT EXISTS idx_pageviews_utm_campaign ON page_views(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_pageviews_first_attr ON page_views USING GIN(first_seen_attribution);
CREATE INDEX IF NOT EXISTS idx_pageviews_last_attr ON page_views USING GIN(last_seen_attribution);
