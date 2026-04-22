CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  default_name TEXT;
BEGIN
  default_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'Amor'
  );
  INSERT INTO public.profiles (id, display_name, avatar_color)
  VALUES (
    NEW.id,
    default_name,
    COALESCE(NEW.raw_user_meta_data->>'avatar_color', '#c0506e')
  );
  RETURN NEW;
END;
$function$;