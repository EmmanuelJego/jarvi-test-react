-- Server-side aggregation for the response-rate charts.
-- Returns counts grouped by channel x period (current/previous) x ISO day-of-week,
-- so both charts (per-channel and per-weekday) and their tables read from one call.

-- Shape-carrier view: defines the GraphQL return type and lets Hasura attach
-- Select permissions. Returns no rows on its own (WHERE false).
CREATE OR REPLACE VIEW public.response_rate_stat AS
SELECT
  ''::text   AS channel,
  ''::text   AS period,
  0::int     AS day_of_week,
  0::bigint  AS sent,
  0::bigint  AS responded
WHERE false;

-- Aggregation function. STABLE + read-only so Hasura exposes it as a query.
-- ISODOW: Monday = 1 ... Sunday = 7.
-- NOTE: argument names are underscore-free on purpose. This project's Hasura uses
-- the graphql-default naming convention (camelCase), which can rename snake_case
-- function args; single-word names pass through unchanged, keeping the GraphQL
-- contract stable (args: { userid, curfrom, curto, prevfrom, prevto }).
CREATE OR REPLACE FUNCTION public.response_rate_stats(
  userid   uuid,
  curfrom  timestamptz,
  curto    timestamptz,
  prevfrom timestamptz,
  prevto   timestamptz
)
RETURNS SETOF public.response_rate_stat
LANGUAGE sql
STABLE
AS $$
  SELECT
    h.type                                                          AS channel,
    p.period                                                        AS period,
    EXTRACT(ISODOW FROM h.created_at)::int                          AS day_of_week,
    COUNT(*)                                                        AS sent,
    COUNT(*) FILTER (WHERE h.trigger_has_been_replied_to IS TRUE)   AS responded
  FROM public.historyentries h
  JOIN LATERAL (
    VALUES
      ('current'::text,  curfrom,  curto),
      ('previous'::text, prevfrom, prevto)
  ) AS p(period, from_ts, to_ts)
    ON h.created_at >= p.from_ts AND h.created_at < p.to_ts
  WHERE h.user_id = userid
    AND h.type IN ('EMAIL_SENT', 'LINKEDIN_MESSAGE_SENT', 'LINKEDIN_INMAIL_SENT')
    AND h.trigger_has_been_replied_to IS NOT NULL
  GROUP BY h.type, p.period, EXTRACT(ISODOW FROM h.created_at);
$$;
