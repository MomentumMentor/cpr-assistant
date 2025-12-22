/*
  # CPR Assistant Database Schema

  1. New Tables
    - `cpr_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `user_name` (text)
      - `communication_mode` (text, friendly/executive)
      - `pathway` (text, cpr/rpc)
      - `intent` (text)
      - `deadline` (date)
      - `current_step` (text)
      - `committed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `contexts`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references cpr_sessions)
      - `content` (text, 1-5 words)
      - `locked_at` (timestamptz)
      - `attempt_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `purposes`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references cpr_sessions)
      - `content` (text)
      - `locked_at` (timestamptz)
      - `attempt_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `results`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references cpr_sessions)
      - `content` (text)
      - `completion_date` (date)
      - `control_level` (text)
      - `locked_at` (timestamptz)
      - `attempt_count` (integer)
      - `sequence_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `obstacles`
      - `id` (uuid, primary key)
      - `result_id` (uuid, references results)
      - `content` (text)
      - `category` (text, internal/external)
      - `created_at` (timestamptz)
    
    - `skynet_analyses`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references cpr_sessions)
      - `survivability_rating` (decimal)
      - `verdict` (text, SUCCESS/FAILURE)
      - `inhibitors` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
*/

-- Create cpr_sessions table
CREATE TABLE IF NOT EXISTS cpr_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    communication_mode TEXT CHECK (communication_mode IN ('friendly', 'executive')),
    pathway TEXT CHECK (pathway IN ('cpr', 'rpc')),
    intent TEXT,
    deadline DATE,
    current_step TEXT,
    committed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contexts table
CREATE TABLE IF NOT EXISTS contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES cpr_sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    locked_at TIMESTAMPTZ,
    attempt_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purposes table
CREATE TABLE IF NOT EXISTS purposes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES cpr_sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    locked_at TIMESTAMPTZ,
    attempt_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create results table
CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES cpr_sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    completion_date DATE NOT NULL,
    control_level TEXT CHECK (control_level IN ('direct', 'partial', 'none')),
    locked_at TIMESTAMPTZ,
    attempt_count INTEGER DEFAULT 1,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create obstacles table
CREATE TABLE IF NOT EXISTS obstacles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID REFERENCES results(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category TEXT CHECK (category IN ('internal', 'external')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create skynet_analyses table
CREATE TABLE IF NOT EXISTS skynet_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES cpr_sessions(id) ON DELETE CASCADE,
    survivability_rating DECIMAL(5,3) NOT NULL,
    verdict TEXT CHECK (verdict IN ('SUCCESS', 'FAILURE')) NOT NULL,
    inhibitors JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cpr_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE obstacles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skynet_analyses ENABLE ROW LEVEL SECURITY;

-- Policies for cpr_sessions
CREATE POLICY "Users can view own sessions"
  ON cpr_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON cpr_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON cpr_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for contexts
CREATE POLICY "Users can view own contexts"
  ON contexts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = contexts.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own contexts"
  ON contexts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = contexts.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own contexts"
  ON contexts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = contexts.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

-- Policies for purposes
CREATE POLICY "Users can view own purposes"
  ON purposes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = purposes.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own purposes"
  ON purposes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = purposes.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own purposes"
  ON purposes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = purposes.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

-- Policies for results
CREATE POLICY "Users can view own results"
  ON results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = results.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own results"
  ON results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = results.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own results"
  ON results FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = results.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

-- Policies for obstacles
CREATE POLICY "Users can view own obstacles"
  ON obstacles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM results 
      JOIN cpr_sessions ON results.session_id = cpr_sessions.id 
      WHERE results.id = obstacles.result_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own obstacles"
  ON obstacles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM results 
      JOIN cpr_sessions ON results.session_id = cpr_sessions.id 
      WHERE results.id = obstacles.result_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

-- Policies for skynet_analyses
CREATE POLICY "Users can view own skynet"
  ON skynet_analyses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = skynet_analyses.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own skynet"
  ON skynet_analyses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cpr_sessions 
      WHERE cpr_sessions.id = skynet_analyses.session_id 
      AND cpr_sessions.user_id = auth.uid()
    )
  );