-- Add device type and session ID to page_views for enhanced analytics
-- Run this in Supabase SQL Editor before deploying the stats page

ALTER TABLE page_views ADD COLUMN IF NOT EXISTS device     text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS session_id text;

CREATE INDEX IF NOT EXISTS idx_pageviews_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_device  ON page_views(device);
