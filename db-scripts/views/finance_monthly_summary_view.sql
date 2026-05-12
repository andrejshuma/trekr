-- View: monthly income summary per user
-- Shows total income per user per month and year
CREATE OR REPLACE VIEW trekr.vw_finance_monthly_summary AS
SELECT
    i.finance_user_id AS user_id,
    EXTRACT(YEAR FROM i.date)::int AS year,
    EXTRACT(MONTH FROM i.date)::int AS month,
    SUM(i.amount) AS total_income
FROM trekr.incomes i
GROUP BY i.finance_user_id, EXTRACT(YEAR FROM i.date), EXTRACT(MONTH FROM i.date);

-- View: current month total money earned for each user
CREATE OR REPLACE VIEW trekr.vw_finance_current_month AS
SELECT
    f.user_id,
    COALESCE(SUM(i.amount), 0) AS total_earned_this_month
FROM trekr.finance_users f
LEFT JOIN trekr.incomes i
    ON i.finance_user_id = f.user_id
    AND date_trunc('month', i.date) = date_trunc('month', current_date)
GROUP BY f.user_id;

