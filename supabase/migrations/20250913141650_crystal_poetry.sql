/*
  # Fix RLS Policies for Anonymous Access

  This migration fixes the Row-Level Security policies to allow anonymous users
  to insert data into all necessary tables while maintaining read security.

  1. Analytics Events
    - Allow anonymous users to insert analytics events
    - Keep read access for authenticated users only

  2. Leads Table  
    - Allow anonymous users to insert leads (form submissions)
    - Keep read access for authenticated users only

  3. Bonus Signups
    - Allow anonymous users to insert bonus signups
    - Keep read access for authenticated users only
*/

-- Fix analytics_events table policies
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Allow anonymous analytics tracking" ON analytics_events;
DROP POLICY IF EXISTS "Authenticated users can read analytics events" ON analytics_events;

-- Create new policy for analytics events
CREATE POLICY "Anonymous can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read analytics events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix leads table policies
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can read leads" ON leads;

-- Create new policy for leads
CREATE POLICY "Anonymous can insert leads"
  ON leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix bonus_signups table policies
DROP POLICY IF EXISTS "Anyone can insert bonus signups" ON bonus_signups;
DROP POLICY IF EXISTS "Authenticated users can read bonus signups" ON bonus_signups;

-- Create new policy for bonus signups
CREATE POLICY "Anonymous can insert bonus signups"
  ON bonus_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read bonus signups"
  ON bonus_signups
  FOR SELECT
  TO authenticated
  USING (true);