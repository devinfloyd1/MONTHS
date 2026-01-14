-- Add completed status fields for each question
-- This allows tracking individual question completion for the sequential flow

ALTER TABLE daily_entries
ADD COLUMN IF NOT EXISTS question_1_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS question_2_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS question_3_completed BOOLEAN DEFAULT FALSE;

-- Update existing entries: mark questions as completed if they have answers
UPDATE daily_entries
SET
  question_1_completed = (question_1_answer IS NOT NULL AND question_1_answer != ''),
  question_2_completed = (question_2_answer IS NOT NULL AND question_2_answer != ''),
  question_3_completed = (question_3_answer IS NOT NULL AND question_3_answer != '');
