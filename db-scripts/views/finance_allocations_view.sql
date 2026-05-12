-- View: calculate allocation amounts per finance category for the current month
CREATE OR REPLACE VIEW trekr.vw_finance_allocations_current_month AS
SELECT
    f.user_id,
    fm.total_earned_this_month,
    f.spending_budget,
    f.saving_budget,
    f.investing_budget,
    f.donation_budget,
    f.credit,
    ROUND((COALESCE(f.spending_budget,0) / 100.0) * fm.total_earned_this_month, 2) AS spending_amount,
    ROUND((COALESCE(f.saving_budget,0) / 100.0) * fm.total_earned_this_month, 2) AS saving_amount,
    ROUND((COALESCE(f.investing_budget,0) / 100.0) * fm.total_earned_this_month, 2) AS investing_amount,
    ROUND((COALESCE(f.donation_budget,0) / 100.0) * fm.total_earned_this_month, 2) AS donation_amount,
    ROUND((COALESCE(f.credit,0) / 100.0) * fm.total_earned_this_month, 2) AS credit_amount
FROM trekr.finance_users f
LEFT JOIN trekr.vw_finance_current_month fm ON fm.user_id = f.user_id;

