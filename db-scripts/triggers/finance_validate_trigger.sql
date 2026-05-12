-- Validate finance percentages on insert/update
-- Ensures the five budget fields sum to ~100 (tolerance 0.01) and each is between 0 and 100
-- Schema: trekr

CREATE OR REPLACE FUNCTION trekr.fn_validate_finance_percentages()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    s NUMERIC;
    eps CONSTANT NUMERIC := 0.01; -- allow small rounding differences
    vals NUMERIC[] := ARRAY[NEW.spending_budget, NEW.saving_budget, NEW.investing_budget, NEW.donation_budget, NEW.credit];
    v NUMERIC;
BEGIN
    -- Null checks: all five values must be provided (business rule)
    FOREACH v IN ARRAY vals LOOP
        IF v IS NULL THEN
            RAISE EXCEPTION 'All 5 finance percentage values are required';
        END IF;
        IF v < 0 OR v > 100 THEN
            RAISE EXCEPTION 'Finance percentage values must be between 0 and 100';
        END IF;
    END LOOP;

    s := (NEW.spending_budget + NEW.saving_budget + NEW.investing_budget + NEW.donation_budget + NEW.credit)::numeric;
    IF abs(s - 100) > eps THEN
        RAISE EXCEPTION 'Finance percentages must sum to 100 (got: %)', s;
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger on finance_users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE t.tgname = 'trg_validate_finance_percentages' AND c.relname = 'finance_users'
    ) THEN
        CREATE TRIGGER trg_validate_finance_percentages
        BEFORE INSERT OR UPDATE ON trekr.finance_users
        FOR EACH ROW
        EXECUTE FUNCTION trekr.fn_validate_finance_percentages();
    END IF;
END$$;

