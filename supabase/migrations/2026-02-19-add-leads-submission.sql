-- Optional written submission payload for interactive writing blocks

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS submission text;

