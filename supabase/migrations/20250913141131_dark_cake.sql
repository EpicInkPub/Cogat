/*
  # Create leads and analytics tables

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `phone` (text)
      - `package_selected` (text)
      - `grade_selected` (text)
      - `source` (text)
      - `session_id` (text)
      - `created_at` (timestamp)
    
    - `bonus_signups`
      - `id` (uuid, primary key)
      - `email` (text)
      - `session_id` (text)
      - `created_at` (timestamp)
    
    - `analytics_events`
      - `id` (uuid, primary key)
      - `event_name` (text)
      - `properties` (jsonb)
      - `session_id` (text)
      - `user_id` (text)
      - `page_url` (text)
      - `user_agent` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public insert access (for form submissions)
    - Add policies for authenticated read access (for admin dashboard)
*/

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  package_selected text NOT NULL,
  grade_selected text NOT NULL,
  source text DEFAULT 'website',
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Create bonus signups table
CREATE TABLE IF NOT EXISTS bonus_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  properties jsonb DEFAULT '{}',
  session_id text,
  user_id text,
  page_url text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public insert (form submissions)
CREATE POLICY "Anyone can insert leads"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can insert bonus signups"
  ON bonus_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policies for authenticated read (admin dashboard)
CREATE POLICY "Authenticated users can read leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read bonus signups"
  ON bonus_signups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read analytics events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS bonus_signups_created_at_idx ON bonus_signups(created_at DESC);
CREATE INDEX IF NOT EXISTS bonus_signups_email_idx ON bonus_signups(email);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_idx ON analytics_events(event_name);