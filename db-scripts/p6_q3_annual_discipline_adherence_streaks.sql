SET search_path TO trekr;

-- P6 Q3 (Annual): Discipline adherence, completion quality, and streak behavior.
-- Change report_year in params CTE when needed.
WITH params AS (
    SELECT 2026::int AS report_year
),
discipline_base AS (
    SELECT
        du.user_id,
        u.username,
        u.email
    FROM discipline_users du
    JOIN users u ON u.user_id = du.user_id
),
task_mix AS (
    SELECT
        COALESCE(t.discipline_user_id, c.user_id) AS user_id,
        COUNT(*) AS total_tasks_defined,
        COUNT(*) FILTER (WHERE t.custom_tracking_id IS NULL) AS core_tasks,
        COUNT(*) FILTER (WHERE t.custom_tracking_id IS NOT NULL) AS custom_tasks,
        COUNT(DISTINCT COALESCE(t.custom_tracking_id::text, 'core')) AS task_category_span
    FROM tasks t
    LEFT JOIN custom_tracking_categories c
        ON c.custom_tracking_id = t.custom_tracking_id
    WHERE t.discipline_user_id IS NOT NULL
       OR t.custom_tracking_id IS NOT NULL
    GROUP BY COALESCE(t.discipline_user_id, c.user_id)
),
annual_daily_completion AS (
    SELECT
        dc.user_id,
        dc.date,
        COALESCE(dc.procent, 0) AS procent,
        CASE WHEN COALESCE(dc.procent, 0) >= 80 THEN 1 ELSE 0 END AS strong_day
    FROM daily_completion dc
    WHERE EXTRACT(YEAR FROM dc.date)::int = (SELECT report_year FROM params)
),
daily_completion_stats AS (
    SELECT
        adc.user_id,
        COUNT(*) AS tracked_days,
        AVG(adc.procent) AS avg_completion_percent,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY adc.procent) AS median_completion_percent,
        COUNT(*) FILTER (WHERE adc.procent = 100) AS perfect_days,
        COUNT(*) FILTER (WHERE adc.procent >= 80) AS strong_days,
        STDDEV_SAMP(adc.procent) AS completion_variability
    FROM annual_daily_completion adc
    GROUP BY adc.user_id
),
strong_day_streaks AS (
    SELECT
        user_id,
        date,
        date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date))::int AS grp
    FROM annual_daily_completion
    WHERE strong_day = 1
),
longest_strong_streak AS (
    SELECT
        user_id,
        MAX(streak_len) AS longest_strong_day_streak
    FROM (
        SELECT user_id, grp, COUNT(*) AS streak_len
        FROM strong_day_streaks
        GROUP BY user_id, grp
    ) s
    GROUP BY user_id
),
annual_task_execution AS (
    SELECT
        dc.user_id,
        COUNT(tdc.task_id) AS completed_task_events
    FROM daily_completion dc
    LEFT JOIN task_daily_completion tdc
        ON tdc.daily_completion_id = dc.daily_completion_id
    WHERE EXTRACT(YEAR FROM dc.date)::int = (SELECT report_year FROM params)
    GROUP BY dc.user_id
)
SELECT
    db.user_id,
    db.username,
    db.email,
    COALESCE(tm.total_tasks_defined, 0) AS total_tasks_defined,
    COALESCE(tm.core_tasks, 0) AS core_tasks,
    COALESCE(tm.custom_tasks, 0) AS custom_tasks,
    COALESCE(tm.task_category_span, 0) AS task_category_span,
    COALESCE(dcs.tracked_days, 0) AS tracked_days,
    ROUND(COALESCE(dcs.avg_completion_percent, 0)::numeric, 2) AS avg_completion_percent,
    ROUND(COALESCE(dcs.median_completion_percent, 0)::numeric, 2) AS median_completion_percent,
    COALESCE(dcs.perfect_days, 0) AS perfect_days,
    COALESCE(dcs.strong_days, 0) AS strong_days,
    ROUND(COALESCE(dcs.completion_variability, 0)::numeric, 4) AS completion_variability,
    COALESCE(ate.completed_task_events, 0) AS completed_task_events,
    COALESCE(lss.longest_strong_day_streak, 0) AS longest_strong_day_streak,
    ROUND(
        COALESCE((COALESCE(dcs.strong_days, 0) / NULLIF(COALESCE(dcs.tracked_days, 0), 0)::numeric), 0),
        4
    ) AS strong_day_ratio,
    ROUND(
        (
            COALESCE(dcs.avg_completion_percent, 0) * 0.45
            + COALESCE(lss.longest_strong_day_streak, 0) * 2.00
            + COALESCE(ate.completed_task_events, 0) * 0.35
        )::numeric,
        2
    ) AS discipline_composite_score,
    DENSE_RANK() OVER (
        ORDER BY
            (
                COALESCE(dcs.avg_completion_percent, 0) * 0.45
                + COALESCE(lss.longest_strong_day_streak, 0) * 2.00
                + COALESCE(ate.completed_task_events, 0) * 0.35
            ) DESC,
            db.user_id ASC
    ) AS discipline_annual_rank
FROM discipline_base db
LEFT JOIN task_mix tm ON tm.user_id = db.user_id
LEFT JOIN daily_completion_stats dcs ON dcs.user_id = db.user_id
LEFT JOIN annual_task_execution ate ON ate.user_id = db.user_id
LEFT JOIN longest_strong_streak lss ON lss.user_id = db.user_id
ORDER BY discipline_annual_rank, db.user_id;


