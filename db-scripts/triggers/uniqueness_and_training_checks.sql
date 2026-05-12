-- Add useful DB constraints and checks

-- Unique index: ensure a user has at most one daily intake per date
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'trekr' AND tablename = 'daily_intakes' AND indexname = 'uq_daily_intake_user_date'
    ) THEN
        CREATE UNIQUE INDEX uq_daily_intake_user_date ON trekr.daily_intakes (weight_user_id, date);
    END IF;
END$$;

-- Prevent inserting training sessions with future date
CREATE OR REPLACE FUNCTION trekr.fn_check_training_date()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.date > current_date THEN
        RAISE EXCEPTION 'Training session date cannot be in the future: %', NEW.date;
    END IF;
    RETURN NEW;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE t.tgname = 'trg_check_training_date' AND c.relname = 'training_sessions'
    ) THEN
        CREATE TRIGGER trg_check_training_date
        BEFORE INSERT OR UPDATE ON trekr.training_sessions
        FOR EACH ROW
        EXECUTE FUNCTION trekr.fn_check_training_date();
    END IF;
END$$;

