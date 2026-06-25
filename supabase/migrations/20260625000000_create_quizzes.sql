-- Practice quizzes for the public site (grammar/vocabulary/reading/listening).
-- NOTE: This is intentionally SEPARATE from the portal `quizzes` table
-- (program quizzes with program_id/created_by/status). Do not merge the two.

CREATE TABLE IF NOT EXISTS public.practice_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('grammar', 'vocabulary', 'reading', 'listening')),
  is_published boolean NOT NULL DEFAULT false,
  cover_image_url text,
  passage text,
  audio_url text,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS practice_quizzes_type_published_idx ON public.practice_quizzes(type, is_published);
CREATE INDEX IF NOT EXISTS practice_quizzes_slug_idx ON public.practice_quizzes(slug);

-- Row Level Security
ALTER TABLE public.practice_quizzes ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can read published quizzes
DROP POLICY IF EXISTS "Public can read published quizzes" ON public.practice_quizzes;
CREATE POLICY "Public can read published quizzes"
  ON public.practice_quizzes
  FOR SELECT
  USING (is_published = true);

-- Admins can read everything (including drafts)
DROP POLICY IF EXISTS "Admins can read all quizzes" ON public.practice_quizzes;
CREATE POLICY "Admins can read all quizzes"
  ON public.practice_quizzes
  FOR SELECT
  TO authenticated
  USING (is_blog_admin());

-- Admins can insert / update / delete
DROP POLICY IF EXISTS "Admins can write quizzes" ON public.practice_quizzes;
CREATE POLICY "Admins can write quizzes"
  ON public.practice_quizzes
  FOR ALL
  TO authenticated
  USING (is_blog_admin())
  WITH CHECK (is_blog_admin());
