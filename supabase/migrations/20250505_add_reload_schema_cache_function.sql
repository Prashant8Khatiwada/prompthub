-- Migration: add helper to reload the PostgREST schema cache from code
-- This allows the app to trigger a schema reload after DB migrations

CREATE OR REPLACE FUNCTION public.reload_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
END;
$$;
