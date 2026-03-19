ALTER TABLE public.toefl_participants
ADD COLUMN IF NOT EXISTS user_id text;

CREATE INDEX IF NOT EXISTS toefl_participants_user_id_idx
ON public.toefl_participants(user_id);
