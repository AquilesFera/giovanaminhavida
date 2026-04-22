DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='player_state';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.player_state; END IF;
END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='gifts';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.gifts; END IF;
END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='chat_messages';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages; END IF;
END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='pet_state';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.pet_state; END IF;
END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='missions_progress';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.missions_progress; END IF;
END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='story_progress';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.story_progress; END IF;
END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='wall_notes';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.wall_notes; END IF;
END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='profiles';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles; END IF;
END $$;

ALTER TABLE public.player_state REPLICA IDENTITY FULL;
ALTER TABLE public.gifts REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.pet_state REPLICA IDENTITY FULL;
ALTER TABLE public.missions_progress REPLICA IDENTITY FULL;
ALTER TABLE public.story_progress REPLICA IDENTITY FULL;
ALTER TABLE public.wall_notes REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;