-- PET
CREATE TABLE public.pet_state (
  id integer PRIMARY KEY DEFAULT 1,
  name text NOT NULL DEFAULT 'Mel',
  x numeric NOT NULL DEFAULT 800,
  y numeric NOT NULL DEFAULT 600,
  hunger integer NOT NULL DEFAULT 50,
  happiness integer NOT NULL DEFAULT 80,
  last_fed timestamptz NOT NULL DEFAULT now(),
  last_pet timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pet_singleton CHECK (id = 1)
);
INSERT INTO public.pet_state (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER TABLE public.pet_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view pet" ON public.pet_state FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can update pet" ON public.pet_state FOR UPDATE TO authenticated USING (true);

-- MISSIONS
CREATE TABLE public.missions_progress (
  mission_id text PRIMARY KEY,
  progress integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.missions_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view missions" ON public.missions_progress FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert missions" ON public.missions_progress FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update missions" ON public.missions_progress FOR UPDATE TO authenticated USING (true);

-- STORY
CREATE TABLE public.story_progress (
  chapter_id integer PRIMARY KEY,
  unlocked boolean NOT NULL DEFAULT false,
  unlocked_at timestamptz
);

ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view story" ON public.story_progress FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert story" ON public.story_progress FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update story" ON public.story_progress FOR UPDATE TO authenticated USING (true);

-- Capítulo 1 já desbloqueado
INSERT INTO public.story_progress (chapter_id, unlocked, unlocked_at) VALUES (1, true, now()) ON CONFLICT DO NOTHING;

-- Couple meta extras
ALTER TABLE public.couple_meta ADD COLUMN IF NOT EXISTS her_site_url text;
ALTER TABLE public.couple_meta ADD COLUMN IF NOT EXISTS couple_name text DEFAULT 'Nós';

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pet_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.missions_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_progress;