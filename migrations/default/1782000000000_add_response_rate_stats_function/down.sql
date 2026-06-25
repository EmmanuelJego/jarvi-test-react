-- Reverse order: drop the function before the view it depends on.
DROP FUNCTION IF EXISTS public.response_rate_stats(uuid, timestamptz, timestamptz, timestamptz, timestamptz);
DROP VIEW IF EXISTS public.response_rate_stat;
