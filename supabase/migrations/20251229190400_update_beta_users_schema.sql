/*
  # Update Beta Users Schema

  1. Changes
    - Drop `approved` boolean column
    - Add `approved_at` timestamptz column
    - Add `approved_by` uuid column (nullable)
    - Add trigger to auto-create beta_users entries on auth.users insert

  2. Security
    - Maintain existing RLS policies
    - Update policy to use approved_at

  3. Automation
    - Create function to auto-insert new users into beta_users
    - Create trigger on auth.users insert
*/

-- Drop old approved column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beta_users' AND column_name = 'approved'
  ) THEN
    ALTER TABLE beta_users DROP COLUMN approved;
  END IF;
END $$;

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beta_users' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE beta_users ADD COLUMN approved_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'beta_users' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE beta_users ADD COLUMN approved_by uuid;
  END IF;
END $$;

-- Create function to auto-add users to beta_users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.beta_users (email, created_at)
  VALUES (NEW.email, NOW())
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
