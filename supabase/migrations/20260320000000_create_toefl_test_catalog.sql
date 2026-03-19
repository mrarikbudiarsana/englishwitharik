CREATE TABLE IF NOT EXISTS public.toefl_test_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  cover_image_url text,
  cta_label text NOT NULL DEFAULT 'Start Test',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.toefl_test_set_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_set_id uuid NOT NULL REFERENCES public.toefl_test_sets(id) ON DELETE CASCADE,
  section text NOT NULL CHECK (section IN ('listening', 'structure', 'reading')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  test_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (test_set_id, section)
);

ALTER TABLE public.toefl_attempts
ADD COLUMN IF NOT EXISTS test_set_id uuid REFERENCES public.toefl_test_sets(id) ON DELETE RESTRICT;

WITH upserted_set AS (
  INSERT INTO public.toefl_test_sets (slug, title, description, is_published)
  VALUES ('default', 'TOEFL ITP Practice Test', 'Migrated from the original TOEFL ITP event flow.', true)
  ON CONFLICT (slug) DO UPDATE
    SET title = EXCLUDED.title,
        description = EXCLUDED.description,
        is_published = EXCLUDED.is_published,
        updated_at = now()
  RETURNING id
), existing_set AS (
  SELECT id FROM upserted_set
  UNION ALL
  SELECT id FROM public.toefl_test_sets WHERE slug = 'default'
  LIMIT 1
)
INSERT INTO public.toefl_test_set_sections (
  test_set_id,
  section,
  title,
  description,
  sort_order,
  is_enabled,
  test_data,
  updated_at
)
SELECT
  existing_set.id,
  t.id,
  COALESCE(t.type, initcap(t.id) || ' Test'),
  '',
  CASE t.id
    WHEN 'listening' THEN 1
    WHEN 'structure' THEN 2
    WHEN 'reading' THEN 3
    ELSE 99
  END,
  true,
  t.test_data,
  COALESCE(t.updated_at, now())
FROM public.toefl_templates t
CROSS JOIN existing_set
WHERE t.id IN ('listening', 'structure', 'reading')
ON CONFLICT (test_set_id, section) DO UPDATE
SET
  test_data = EXCLUDED.test_data,
  title = EXCLUDED.title,
  updated_at = EXCLUDED.updated_at;

WITH default_set AS (
  SELECT id
  FROM public.toefl_test_sets
  WHERE slug = 'default'
  LIMIT 1
)
UPDATE public.toefl_attempts
SET test_set_id = default_set.id
FROM default_set
WHERE public.toefl_attempts.test_set_id IS NULL;

ALTER TABLE public.toefl_attempts
ALTER COLUMN test_set_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS toefl_attempts_participant_set_section_idx
ON public.toefl_attempts(participant_id, test_set_id, section, completed_at);

CREATE INDEX IF NOT EXISTS toefl_attempts_test_set_section_started_idx
ON public.toefl_attempts(test_set_id, section, started_at DESC);

CREATE INDEX IF NOT EXISTS toefl_attempts_test_set_started_idx
ON public.toefl_attempts(test_set_id, started_at DESC);
