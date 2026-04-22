SET search_path TO trekr;

-- P6 Q2 (Annual): Training consistency, workload trend, and peak period analysis.
-- Change report_year in params CTE when needed.
WITH params AS (
    SELECT 2026::int AS report_year
),
months AS (
    SELECT generate_series(1, 12) AS month_no
),
training_base AS (
    SELECT
        tu.user_id,
        u.username,
        u.email,
        tu.gender,
        tu.age,
        tu.weight
    FROM training_users tu
    JOIN users u ON u.user_id = tu.user_id
),
monthly_sessions AS (
    SELECT
        tb.user_id,
        m.month_no,
        COALESCE(COUNT(ts.training_id), 0) AS sessions_count,
        COALESCE(SUM(ts.duration), 0) AS total_duration_minutes,
        COALESCE(SUM(ts.calories), 0) AS total_calories,
        COALESCE(AVG(ts.duration), 0) AS avg_session_duration,
        COALESCE(AVG(ts.calories), 0) AS avg_session_calories
    FROM training_base tb
    CROSS JOIN months m
    LEFT JOIN training_sessions ts
        ON ts.training_user_id = tb.user_id
       AND EXTRACT(YEAR FROM ts.date)::int = (SELECT report_year FROM params)
       AND EXTRACT(MONTH FROM ts.date)::int = m.month_no
    GROUP BY tb.user_id, m.month_no
),
monthly_ranked AS (
    SELECT
        ms.*,
        DENSE_RANK() OVER (PARTITION BY ms.user_id ORDER BY ms.total_calories DESC, ms.month_no ASC) AS peak_calorie_month_rank,
        DENSE_RANK() OVER (PARTITION BY ms.user_id ORDER BY ms.sessions_count DESC, ms.month_no ASC) AS peak_sessions_month_rank
    FROM monthly_sessions ms
),
active_month_streaks AS (
    SELECT
        user_id,
        month_no,
        month_no - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY month_no) AS grp
    FROM monthly_sessions
    WHERE sessions_count > 0
),
longest_streak AS (
    SELECT
        user_id,
        MAX(streak_len) AS longest_active_month_streak
    FROM (
        SELECT user_id, grp, COUNT(*) AS streak_len
        FROM active_month_streaks
        GROUP BY user_id, grp
    ) s
    GROUP BY user_id
),
annual_training AS (
    SELECT
        user_id,
        SUM(sessions_count) AS annual_sessions,
        SUM(total_duration_minutes) AS annual_duration_minutes,
        SUM(total_calories) AS annual_calories,
        AVG(total_duration_minutes) AS avg_monthly_duration,
        AVG(total_calories) AS avg_monthly_calories,
        COUNT(*) FILTER (WHERE sessions_count > 0) AS active_months,
        REGR_SLOPE(total_calories::numeric, month_no::numeric) AS calories_trend_slope,
        REGR_SLOPE(total_duration_minutes::numeric, month_no::numeric) AS duration_trend_slope
    FROM monthly_sessions
    GROUP BY user_id
),
peak_months AS (
    SELECT
        user_id,
        MAX(month_no) FILTER (WHERE peak_calorie_month_rank = 1) AS peak_calorie_month_no,
        MAX(month_no) FILTER (WHERE peak_sessions_month_rank = 1) AS peak_sessions_month_no
    FROM monthly_ranked
    GROUP BY user_id
)
SELECT
    tb.user_id,
    tb.username,
    tb.email,
    tb.gender,
    tb.age,
    tb.weight,
    at.annual_sessions,
    ROUND(at.annual_duration_minutes::numeric, 2) AS annual_duration_minutes,
    ROUND(at.annual_calories::numeric, 2) AS annual_calories,
    at.active_months,
    ROUND((at.active_months / 12.0)::numeric, 4) AS consistency_ratio,
    COALESCE(ls.longest_active_month_streak, 0) AS longest_active_month_streak,
    pm.peak_calorie_month_no,
    pm.peak_sessions_month_no,
    ROUND(COALESCE(at.calories_trend_slope, 0)::numeric, 4) AS calories_trend_slope,
    ROUND(COALESCE(at.duration_trend_slope, 0)::numeric, 4) AS duration_trend_slope,
    DENSE_RANK() OVER (
        ORDER BY
            at.annual_calories DESC,
            at.active_months DESC,
            COALESCE(ls.longest_active_month_streak, 0) DESC,
            tb.user_id ASC
    ) AS training_annual_rank
FROM training_base tb
JOIN annual_training at ON at.user_id = tb.user_id
JOIN peak_months pm ON pm.user_id = tb.user_id
LEFT JOIN longest_streak ls ON ls.user_id = tb.user_id
ORDER BY training_annual_rank, tb.user_id;

