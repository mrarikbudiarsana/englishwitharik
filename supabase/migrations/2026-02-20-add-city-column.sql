-- Add city column to page_views for granular location analytics
-- Run this in Supabase SQL Editor

ALTER TABLE page_views ADD COLUMN IF NOT EXISTS city text;

CREATE INDEX IF NOT EXISTS idx_pageviews_city ON page_views(city);
