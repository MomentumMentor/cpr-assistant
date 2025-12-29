/*
  # Add Upload Fields to CPR Sessions

  1. New Columns
    - `uploaded_file_url` (text) - URL to the uploaded file in storage
    - `uploaded_file_name` (text) - Original filename of the uploaded file
    - `parsing_status` (text) - Status of the file parsing: pending, success, failed, manual_review

  2. Changes
    - Add columns to support file uploads and tracking parsing status

  3. Notes
    - These fields are optional and only populated when a user uploads a CPR document
    - parsing_status helps track whether we successfully extracted Context, Purpose, and Results
*/

-- Add uploaded_file_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cpr_sessions' AND column_name = 'uploaded_file_url'
  ) THEN
    ALTER TABLE cpr_sessions ADD COLUMN uploaded_file_url TEXT;
  END IF;
END $$;

-- Add uploaded_file_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cpr_sessions' AND column_name = 'uploaded_file_name'
  ) THEN
    ALTER TABLE cpr_sessions ADD COLUMN uploaded_file_name TEXT;
  END IF;
END $$;

-- Add parsing_status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cpr_sessions' AND column_name = 'parsing_status'
  ) THEN
    ALTER TABLE cpr_sessions ADD COLUMN parsing_status TEXT CHECK (parsing_status IN ('pending', 'success', 'failed', 'manual_review'));
  END IF;
END $$;

-- Create index on parsing_status for faster queries
CREATE INDEX IF NOT EXISTS cpr_sessions_parsing_status_idx ON cpr_sessions(parsing_status);
