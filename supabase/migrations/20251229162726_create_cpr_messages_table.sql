/*
  # Create CPR Messages Table

  1. New Tables
    - `cpr_messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references cpr_sessions)
      - `role` (text, user/assistant)
      - `content` (text, message content)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `cpr_messages` table
    - Add policies for authenticated users to access messages from their sessions
*/

-- Create cpr_messages table
CREATE TABLE IF NOT EXISTS cpr_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES cpr_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cpr_messages ENABLE ROW LEVEL SECURITY;

-- Policies for cpr_messages
CREATE POLICY "Users can view own messages"
  ON cpr_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = cpr_messages.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages"
  ON cpr_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = cpr_messages.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cpr_messages_session_id ON cpr_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_cpr_messages_created_at ON cpr_messages(created_at);