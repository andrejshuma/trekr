-- Flyway Migration: Expand TASKS table with description, due_date, priority, and status enum
-- This migration adds new columns to support custom tracking tasks with enhanced details.
-- Daily discipline tasks will use NULL for these optional fields.

SET search_path TO trekr;

-- Create ENUM type for task status
CREATE TYPE task_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'FINISHED');

-- Add new columns to TASKS table
ALTER TABLE trekr.tasks
ADD COLUMN description TEXT,
ADD COLUMN due_date DATE,
ADD COLUMN priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
ADD COLUMN status task_status DEFAULT 'NOT_STARTED';

-- For backwards compatibility, migrate is_finished to status
-- is_finished = true → status = FINISHED
-- is_finished = false → status = NOT_STARTED
UPDATE trekr.tasks
SET status = CASE
    WHEN is_finished = true THEN 'FINISHED'::task_status
    ELSE 'NOT_STARTED'::task_status
END;

-- Drop the is_finished column (after migration)
ALTER TABLE trekr.tasks
DROP COLUMN is_finished;

-- Add index for filtering tasks by status and custom_tracking_id
CREATE INDEX idx_tasks_custom_tracking_status
ON trekr.tasks(custom_tracking_id, status)
WHERE custom_tracking_id IS NOT NULL;

-- Add index for filtering by discipline_user_id and status (for daily completion computation)
CREATE INDEX idx_tasks_discipline_status
ON trekr.tasks(discipline_user_id, status)
WHERE discipline_user_id IS NOT NULL;

-- Add index for due_date filtering (useful for reports)
CREATE INDEX idx_tasks_due_date
ON trekr.tasks(due_date)
WHERE due_date IS NOT NULL;

