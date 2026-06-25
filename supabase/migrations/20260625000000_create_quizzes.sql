CREATE TABLE IF NOT EXISTS public.quizzes (
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

CREATE INDEX IF NOT EXISTS quizzes_type_published_idx ON public.quizzes(type, is_published);
CREATE INDEX IF NOT EXISTS quizzes_slug_idx ON public.quizzes(slug);
