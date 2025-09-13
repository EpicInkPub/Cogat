/*
  # Fix Analytics RLS Policy for Anonymous Users

  1. Security Changes
    - Update RLS policy on `analytics_events` table to allow anonymous insertions
    - Remove duplicate policies and create a single comprehensive policy
    - Ensure anonymous users can track events without authentication

  This fixes the "new row violates row-level security policy" error by allowing
  the `anon` role to insert analytics events, which is necessary for tracking
  user behavior before they sign up or log in.
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow anonymous analytics tracking" ON analytics_events;
DROP POLICY IF EXISTS "Anonymous can insert analytics events" ON analytics_events;

-- Create a single comprehensive policy for anonymous analytics tracking
CREATE POLICY "Allow anonymous analytics tracking" ON analytics_events
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure the existing read policy remains for authenticated users
DROP POLICY IF EXISTS "Authenticated can read analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Authenticated users can read analytics events" ON analytics_events;

CREATE POLICY "Authenticated users can read analytics events" ON analytics_events
  FOR SELECT 
  TO authenticated
  USING (true);