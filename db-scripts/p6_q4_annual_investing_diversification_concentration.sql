SET search_path TO trekr;

-- P6 Q4 (Annual): Investing diversification, concentration risk, and contribution pacing.
-- Change report_year in params CTE when needed.
WITH params AS (
    SELECT 2026::int AS report_year
),
months AS (
    SELECT generate_series(1, 12) AS month_no
),
investor_base AS (
    SELECT
        iu.user_id,
        u.username,
        u.email
    FROM investor_users iu
    JOIN users u ON u.user_id = iu.user_id
),
annual_asset_lots AS (
    SELECT
        a.user_id,
        a.ticker_symbol,
        COALESCE(a.quantity, 0) AS quantity,
        COALESCE(a.buy_price, 0) AS buy_price,
        COALESCE(a.quantity, 0) * COALESCE(a.buy_price, 0) AS invested_amount,
        a.buy_date
    FROM assets a
    WHERE EXTRACT(YEAR FROM a.buy_date)::int = (SELECT report_year FROM params)
),
ticker_rollup AS (
    SELECT
        aal.user_id,
        aal.ticker_symbol,
        SUM(aal.quantity) AS total_quantity,
        SUM(aal.invested_amount) AS total_invested_amount,
        COUNT(*) AS lot_count,
        MIN(aal.buy_date) AS first_buy_date,
        MAX(aal.buy_date) AS last_buy_date
    FROM annual_asset_lots aal
    GROUP BY aal.user_id, aal.ticker_symbol
),
portfolio_totals AS (
    SELECT
        user_id,
        SUM(total_invested_amount) AS annual_total_invested,
        SUM(lot_count) AS annual_lot_count,
        COUNT(*) AS distinct_tickers
    FROM ticker_rollup
    GROUP BY user_id
),
weights AS (
    SELECT
        tr.user_id,
        tr.ticker_symbol,
        tr.total_invested_amount,
        pt.annual_total_invested,
        (tr.total_invested_amount / NULLIF(pt.annual_total_invested, 0)) AS position_weight,
        DENSE_RANK() OVER (
            PARTITION BY tr.user_id
            ORDER BY tr.total_invested_amount DESC, tr.ticker_symbol ASC
        ) AS position_rank
    FROM ticker_rollup tr
    JOIN portfolio_totals pt ON pt.user_id = tr.user_id
),
concentration AS (
    SELECT
        user_id,
        SUM(position_weight * position_weight) AS hhi_concentration,
        MAX(position_weight) AS top_position_weight,
        MAX(ticker_symbol) FILTER (WHERE position_rank = 1) AS top_ticker
    FROM weights
    GROUP BY user_id
),
monthly_investment AS (
    SELECT
        ib.user_id,
        m.month_no,
        COALESCE(SUM(a.quantity * a.buy_price), 0) AS monthly_invested_amount
    FROM investor_base ib
    CROSS JOIN months m
    LEFT JOIN assets a
        ON a.user_id = ib.user_id
       AND EXTRACT(YEAR FROM a.buy_date)::int = (SELECT report_year FROM params)
       AND EXTRACT(MONTH FROM a.buy_date)::int = m.month_no
    GROUP BY ib.user_id, m.month_no
),
monthly_investment_stats AS (
    SELECT
        user_id,
        AVG(monthly_invested_amount) AS avg_monthly_contribution,
        STDDEV_SAMP(monthly_invested_amount) AS contribution_stddev,
        COUNT(*) FILTER (WHERE monthly_invested_amount > 0) AS active_investing_months
    FROM monthly_investment
    GROUP BY user_id
)
SELECT
    ib.user_id,
    ib.username,
    ib.email,
    COALESCE(pt.annual_total_invested, 0) AS annual_total_invested,
    COALESCE(pt.annual_lot_count, 0) AS annual_lot_count,
    COALESCE(pt.distinct_tickers, 0) AS distinct_tickers,
    ROUND(COALESCE(ms.avg_monthly_contribution, 0)::numeric, 2) AS avg_monthly_contribution,
    COALESCE(ms.active_investing_months, 0) AS active_investing_months,
    ROUND((COALESCE(ms.active_investing_months, 0) / 12.0)::numeric, 4) AS activity_ratio,
    ROUND(COALESCE(c.hhi_concentration, 0)::numeric, 4) AS hhi_concentration,
    ROUND((1 - COALESCE(c.hhi_concentration, 1))::numeric, 4) AS diversification_index,
    ROUND(COALESCE(c.top_position_weight, 0)::numeric, 4) AS top_position_weight,
    c.top_ticker,
    ROUND((COALESCE(ms.contribution_stddev, 0) / NULLIF(ms.avg_monthly_contribution, 0))::numeric, 4) AS contribution_volatility_cv,
    DENSE_RANK() OVER (
        ORDER BY
            (1 - COALESCE(c.hhi_concentration, 1)) DESC,
            COALESCE(pt.annual_total_invested, 0) DESC,
            COALESCE(ms.active_investing_months, 0) DESC,
            ib.user_id ASC
    ) AS investing_annual_rank
FROM investor_base ib
LEFT JOIN portfolio_totals pt ON pt.user_id = ib.user_id
LEFT JOIN concentration c ON c.user_id = ib.user_id
LEFT JOIN monthly_investment_stats ms ON ms.user_id = ib.user_id
ORDER BY investing_annual_rank, ib.user_id;

