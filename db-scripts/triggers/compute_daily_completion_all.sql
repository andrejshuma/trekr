-- Compute daily completion for all discipline users for a given date
-- Usage: SELECT trekr.fn_compute_daily_completion_for_all(day := DATE '2026-05-06');

CREATE OR REPLACE FUNCTION trekr.fn_compute_daily_completion_for_all(day date)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    u RECORD;
BEGIN
    IF day IS NULL THEN
        RAISE EXCEPTION 'day is required';
    END IF;

    FOR u IN SELECT user_id FROM trekr.discipline_users LOOP
        BEGIN
            PERFORM trekr.fn_compute_daily_completion(u.user_id, day);
        EXCEPTION WHEN OTHERS THEN
            -- log and continue (requires a logging table or use RAISE NOTICE)
            RAISE NOTICE 'compute_daily_completion failed for user %: %', u.user_id, SQLERRM;
        END;
    END LOOP;
END;
$$;

-- Optionally create a pg_cron job to run nightly (requires pg_cron extension)
-- Example (commented):
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('compute_daily_completions_every_day', '59 23 * * *',
--     $$SELECT trekr.fn_compute_daily_completion_for_all(current_date - INTERVAL '1 day')$$);

