-- Limpar dados legacy
DELETE FROM public.missions_progress;
DELETE FROM public.story_progress;
DELETE FROM public.pet_state;

-- Tabela de mundos compartilhados por código
CREATE TABLE IF NOT EXISTS public.worlds (
  code TEXT PRIMARY KEY,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view worlds" ON public.worlds;
CREATE POLICY "Anyone authenticated can view worlds"
ON public.worlds FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can create worlds" ON public.worlds;
CREATE POLICY "Authenticated can create worlds"
ON public.worlds FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Adicionar world_code (idempotente)
ALTER TABLE public.player_state ADD COLUMN IF NOT EXISTS world_code TEXT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS world_code TEXT;
ALTER TABLE public.gifts ADD COLUMN IF NOT EXISTS world_code TEXT;
ALTER TABLE public.wall_notes ADD COLUMN IF NOT EXISTS world_code TEXT;
ALTER TABLE public.missions_progress ADD COLUMN IF NOT EXISTS world_code TEXT;
ALTER TABLE public.story_progress ADD COLUMN IF NOT EXISTS world_code TEXT;
ALTER TABLE public.pet_state ADD COLUMN IF NOT EXISTS world_code TEXT;

-- PKs únicas por mundo
ALTER TABLE public.missions_progress DROP CONSTRAINT IF EXISTS missions_progress_pkey;
ALTER TABLE public.missions_progress ALTER COLUMN world_code SET NOT NULL;
ALTER TABLE public.missions_progress ADD PRIMARY KEY (mission_id, world_code);

ALTER TABLE public.story_progress DROP CONSTRAINT IF EXISTS story_progress_pkey;
ALTER TABLE public.story_progress ALTER COLUMN world_code SET NOT NULL;
ALTER TABLE public.story_progress ADD PRIMARY KEY (chapter_id, world_code);

ALTER TABLE public.pet_state DROP CONSTRAINT IF EXISTS pet_state_pkey;
ALTER TABLE public.pet_state ALTER COLUMN world_code SET NOT NULL;
ALTER TABLE public.pet_state ADD PRIMARY KEY (world_code);
ALTER TABLE public.pet_state DROP COLUMN IF EXISTS id;

-- Permitir insert de pet por authenticated
DROP POLICY IF EXISTS "Authenticated can insert pet" ON public.pet_state;
CREATE POLICY "Authenticated can insert pet"
ON public.pet_state FOR INSERT TO authenticated WITH CHECK (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_player_state_world ON public.player_state(world_code);
CREATE INDEX IF NOT EXISTS idx_chat_world ON public.chat_messages(world_code);
CREATE INDEX IF NOT EXISTS idx_gifts_world ON public.gifts(world_code);
CREATE INDEX IF NOT EXISTS idx_wall_world ON public.wall_notes(world_code);
