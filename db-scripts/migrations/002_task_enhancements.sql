-- Migration 002: Add description, due_date, priority, status to tasks
-- Replace is_finished boolean with status enum string

SET search_path TO trekr;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(10);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status VARCHAR(20);

-- Migrate existing data from is_finished to status
UPDATE tasks SET status = CASE WHEN is_finished THEN 'FINISHED' ELSE 'NOT_STARTED' END WHERE status IS NULL;

ALTER TABLE tasks ALTER COLUMN status SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'NOT_STARTED';

ALTER TABLE tasks DROP COLUMN IF EXISTS is_finished;
