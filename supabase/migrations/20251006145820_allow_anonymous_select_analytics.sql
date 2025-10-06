/*
  # Allow Anonymous Users to View Analytics Data

  1. Changes
    - Update leads table SELECT policy to allow anonymous users
    - Update bonus_signups table SELECT policy to allow anonymous users
    - Update analytics_events table SELECT policy to allow anonymous users
    
  2. Security Note
    - This allows anyone to view all submitted data without authentication
    - Consider adding authentication if you need to protect this data
    - Data submission (INSERT) was already allowed for anonymous users
*/

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Authenticated can read leads" ON leads;
DROP POLICY IF EXISTS "Authenticated can read bonus signups" ON bonus_signups;
DROP POLICY IF EXISTS "ae_select_auth" ON analytics_events;

-- Create new SELECT policies that allow both anonymous and authenticated users
CREATE POLICY "Anyone can read leads"
  ON leads FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read bonus signups"
  ON bonus_signups FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read analytics events"
  ON analytics_events FOR SELECT
  TO anon, authenticated
  USING (true);