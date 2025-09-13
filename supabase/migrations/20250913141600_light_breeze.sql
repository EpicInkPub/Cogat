/*
  # Fix Analytics RLS Policy

  1. Security Updates
    - Update RLS policy for analytics_events table to allow anonymous inserts
    - This allows the website to track analytics from all visitors
    - Keep read access restricted to authenticated users only

  2. Changes
    - Modify INSERT policy for analytics_events to allow anon role
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON analytics_events;

-- Create a new policy that allows anonymous users to insert analytics events
CREATE POLICY "Allow anonymous analytics tracking"
  ON analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure authenticated users can still read analytics data
CREATE POLICY "Authenticated users can read analytics events" 
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (true);