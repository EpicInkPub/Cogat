/*
  # Fix Analytics RLS Policy

  This migration fixes the Row Level Security policy for analytics_events table
  to allow anonymous users to insert analytics data.

  ## Changes
  1. Clean up any existing conflicting policies
  2. Create proper INSERT policy for both anon and authenticated users
  3. Maintain SELECT policy for authenticated users only
  4. Use explicit public schema qualifiers as recommended by Supabase
*/

-- Ensure we're operating on the real table in the public schema
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop any old or conflicting policies
DROP POLICY IF EXISTS "events: anon can insert" ON public.analytics_events;
DROP POLICY IF EXISTS "events: authenticated can insert own" ON public.analytics_events;
DROP POLICY IF EXISTS "ae_insert_anon_auth" ON public.analytics_events;
DROP POLICY IF EXISTS "ae_select_auth" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow anonymous analytics tracking" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can read analytics events" ON public.analytics_events;

-- ✅ Allow BOTH anon and authenticated to INSERT anything (safe for analytics)
CREATE POLICY "ae_insert_anon_auth"
ON public.analytics_events
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ✅ Allow authenticated users to read analytics (adjust if you also want anon reads)
CREATE POLICY "ae_select_auth"
ON public.analytics_events
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true);