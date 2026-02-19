-- Store blog article ratings from visitors

CREATE TABLE IF NOT EXISTS post_ratings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  rating     smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  session_id text NOT NULL,
  path       text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT post_ratings_post_session_unique UNIQUE (post_id, session_id)
);

CREATE OR REPLACE FUNCTION update_post_ratings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS post_ratings_updated_at ON post_ratings;
CREATE TRIGGER post_ratings_updated_at
BEFORE UPDATE ON post_ratings
FOR EACH ROW
EXECUTE FUNCTION update_post_ratings_updated_at();

ALTER TABLE post_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_ratings_public_insert" ON post_ratings;
DROP POLICY IF EXISTS "post_ratings_admin_read" ON post_ratings;
CREATE POLICY "post_ratings_public_insert" ON post_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "post_ratings_admin_read" ON post_ratings FOR SELECT USING (is_blog_admin());

CREATE INDEX IF NOT EXISTS idx_post_ratings_post_id ON post_ratings(post_id);
CREATE INDEX IF NOT EXISTS idx_post_ratings_created_at ON post_ratings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_ratings_rating ON post_ratings(rating);
