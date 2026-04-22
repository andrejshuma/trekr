SET search_path TO trekr;

-- P6 Q1 (Annual): Finance budget resilience and income stability leaderboard.
-- Change report_year in params CTE when needed.
WITH params AS (
    SELECT 2026::int AS report_year
),
months AS (
    SELECT generate_series(1, 12) AS month_no
),
finance_base AS (
    SELECT
        fu.user_id,
        u.username,
        u.email,
        COALESCE(fu.spending_budget, 0) AS spending_budget,
        COALESCE(fu.saving_budget, 0) AS saving_budget,
        COALESCE(fu.investing_budget, 0) AS investing_budget,
        COALESCE(fu.donation_budget, 0) AS donation_budget,
        COALESCE(fu.credit, 0) AS credit
    FROM finance_users fu
    JOIN users u ON u.user_id = fu.user_id
),
monthly_income AS (
    SELECT
        fb.user_id,
        m.month_no,
        COALESCE(SUM(i.amount), 0) AS month_income
    FROM finance_base fb
    CROSS JOIN months m
    LEFT JOIN incomes i
        ON i.user_id = fb.user_id
       AND EXTRACT(YEAR FROM i.date)::int = (SELECT report_year FROM params)
       AND EXTRACT(MONTH FROM i.date)::int = m.month_no
    GROUP BY fb.user_id, m.month_no
),
monthly_income_ranked AS (
    SELECT
        mi.*,
        DENSE_RANK() OVER (PARTITION BY mi.user_id ORDER BY mi.month_income DESC, mi.month_no ASC) AS best_month_rank,
        DENSE_RANK() OVER (PARTITION BY mi.user_id ORDER BY mi.month_income ASC, mi.month_no ASC) AS worst_month_rank
    FROM monthly_income mi
),
annual_income AS (
    SELECT
        user_id,
        SUM(month_income) AS total_income,
        AVG(month_income) AS avg_monthly_income,
        STDDEV_SAMP(month_income) AS income_stddev,
        MAX(month_income) AS best_month_income,
        MIN(month_income) AS worst_month_income,
        COUNT(*) FILTER (WHERE month_income > 0) AS active_income_months
    FROM monthly_income
    GROUP BY user_id
),
best_worst_months AS (
    SELECT
        user_id,
        MAX(month_no) FILTER (WHERE best_month_rank = 1) AS best_month_no,
        MAX(month_no) FILTER (WHERE worst_month_rank = 1) AS worst_month_no
    FROM monthly_income_ranked
    GROUP BY user_id
)
SELECT
    fb.user_id,
    fb.username,
    fb.email,
    (fb.spending_budget + fb.saving_budget + fb.investing_budget + fb.donation_budget) * 12 AS planned_annual_budget,
    ai.total_income AS actual_annual_income,
    ai.avg_monthly_income,
    ai.active_income_months,
    ai.best_month_income,
    ai.worst_month_income,
    bwm.best_month_no,
    bwm.worst_month_no,
    ROUND(
        (ai.income_stddev / NULLIF(ai.avg_monthly_income, 0))::numeric,
        4
    ) AS income_volatility_cv,
    ROUND(
        (ai.total_income - (fb.spending_budget * 12))::numeric,
        2
    ) AS annual_free_cash_after_spending,
    ROUND(
        ((fb.spending_budget * 12) / NULLIF(ai.total_income, 0))::numeric,
        4
    ) AS spending_pressure_ratio,
    ROUND(
        (fb.credit / NULLIF(ai.total_income, 0))::numeric,
        4
    ) AS leverage_ratio,
    DENSE_RANK() OVER (
        ORDER BY
            (ai.total_income - (fb.spending_budget * 12)) DESC,
            ((fb.spending_budget * 12) / NULLIF(ai.total_income, 0)) ASC,
            fb.user_id ASC
    ) AS finance_resilience_rank
FROM finance_base fb
JOIN annual_income ai ON ai.user_id = fb.user_id
JOIN best_worst_months bwm ON bwm.user_id = fb.user_id
ORDER BY finance_resilience_rank, fb.user_id;

