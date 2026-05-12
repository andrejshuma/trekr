-- Compute daily completion for a single user and date entirely in the DB
-- Inserts a daily_completions row (if not exists), links finished tasks into task_daily_completions,
-- and resets tasks.finished = false for that user.
-- Usage: SELECT trekr.fn_compute_daily_completion(user_id := 123, day := DATE '2026-05-06');

CREATE OR REPLACE FUNCTION trekr.fn_compute_daily_completion(user_id bigint, day date)
RETURNS TABLE(created boolean, daily_completion_id bigint, procent numeric)
LANGUAGE plpgsql
AS $$
DECLARE
    total_count bigint;
    finished_count bigint;
    pct numeric;
    dc_id bigint;
    user_rec record;
    finished_tasks RECORD;
BEGIN
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'user_id is required';
    END IF;
    IF day IS NULL THEN
        RAISE EXCEPTION 'day is required';
    END IF;
    IF day > current_date THEN
        RAISE EXCEPTION 'date cannot be in the future';
    END IF;

    -- ensure user tracking exists: rely on discipline_users table existence
    IF NOT EXISTS (SELECT 1 FROM trekr.discipline_users du WHERE du.user_id = user_id) THEN
        RAISE EXCEPTION 'Discipline tracking is not enabled for this user';
    END IF;

    -- if already computed for that user+date, return existing
    SELECT dc.daily_completion_id, dc.procent INTO dc_id, pct
    FROM trekr.daily_completions dc
    WHERE dc.user_id = user_id AND dc.date = day
    LIMIT 1;

    IF dc_id IS NOT NULL THEN
        RETURN QUERY SELECT false, dc_id, pct;
        RETURN;
    END IF;

    SELECT COUNT(*) INTO total_count FROM trekr.tasks t WHERE t.discipline_user_id = (
        SELECT du.discipline_user_id FROM trekr.discipline_users du WHERE du.user_id = user_id
    );

    SELECT COUNT(*) INTO finished_count FROM trekr.tasks t WHERE t.discipline_user_id = (
        SELECT du.discipline_user_id FROM trekr.discipline_users du WHERE du.user_id = user_id
    ) AND t.finished = true;

    IF total_count <= 0 THEN
        pct := 0;
    ELSE
        pct := round((finished_count::numeric * 100) / total_count::numeric, 2);
    END IF;

    -- insert daily completion
    INSERT INTO trekr.daily_completions (user_id, date, procent)
    VALUES (user_id, day, pct)
    RETURNING daily_completion_id INTO dc_id;

    -- link finished tasks
    FOR finished_tasks IN
        SELECT t.task_id FROM trekr.tasks t
        WHERE t.discipline_user_id = (
            SELECT du.discipline_user_id FROM trekr.discipline_users du WHERE du.user_id = user_id
        ) AND t.finished = true
    LOOP
        INSERT INTO trekr.task_daily_completions (task_id, daily_completion_id)
        VALUES (finished_tasks.task_id, dc_id)
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- reset all tasks for user
    UPDATE trekr.tasks t SET finished = false
    WHERE t.discipline_user_id = (
        SELECT du.discipline_user_id FROM trekr.discipline_users du WHERE du.user_id = user_id
    );

    RETURN QUERY SELECT true, dc_id, pct;
END;
$$;

