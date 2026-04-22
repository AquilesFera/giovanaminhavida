
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Amor',
  avatar_color TEXT NOT NULL DEFAULT '#c0506e',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Player state (position, scene)
CREATE TABLE public.player_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  x NUMERIC NOT NULL DEFAULT 400,
  y NUMERIC NOT NULL DEFAULT 300,
  direction TEXT NOT NULL DEFAULT 'down',
  scene TEXT NOT NULL DEFAULT 'garden',
  is_online BOOLEAN NOT NULL DEFAULT false,
  holding_hands BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.player_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view player state"
  ON public.player_state FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can upsert own state"
  ON public.player_state FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own state"
  ON public.player_state FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- Chat messages (ephemeral bubbles)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  scene TEXT NOT NULL DEFAULT 'garden',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view chat"
  ON public.chat_messages FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can insert own messages"
  ON public.chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Gifts left in the scene
CREATE TABLE public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_type TEXT NOT NULL DEFAULT 'rose',
  scene TEXT NOT NULL DEFAULT 'garden',
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  opened BOOLEAN NOT NULL DEFAULT false,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view gifts"
  ON public.gifts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated can insert gifts"
  ON public.gifts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = from_user);

CREATE POLICY "Authenticated can update gifts"
  ON public.gifts FOR UPDATE
  TO authenticated USING (true);

-- Wall notes
CREATE TABLE public.wall_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#f5e6ea',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wall_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view notes"
  ON public.wall_notes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated can insert notes"
  ON public.wall_notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete own notes"
  ON public.wall_notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Couple meta (single row, anniversary etc)
CREATE TABLE public.couple_meta (
  id INT PRIMARY KEY DEFAULT 1,
  anniversary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT singleton CHECK (id = 1)
);

ALTER TABLE public.couple_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view meta"
  ON public.couple_meta FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated can update meta"
  ON public.couple_meta FOR UPDATE
  TO authenticated USING (true);

INSERT INTO public.couple_meta (id, anniversary_date) VALUES (1, CURRENT_DATE);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_color', '#c0506e')
  );
  INSERT INTO public.player_state (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime
ALTER TABLE public.player_state REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.gifts REPLICA IDENTITY FULL;
ALTER TABLE public.wall_notes REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.player_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gifts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wall_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
