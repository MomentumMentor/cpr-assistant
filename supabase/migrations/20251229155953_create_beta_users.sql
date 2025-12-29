/*
  # Create Beta Users Table

  1. New Tables
    - `beta_users`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `approved` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `beta_users` table
    - Add policy for authenticated users to read their own beta status
*/

CREATE TABLE IF NOT EXISTS beta_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE beta_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own beta status"
  ON beta_users
  FOR SELECT
  TO authenticated
  USING (auth.email() = email);

CREATE INDEX IF NOT EXISTS beta_users_email_idx ON beta_users(email);
