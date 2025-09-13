```sql
-- Disable RLS for all affected tables to allow dropping and recreating policies cleanly
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_signups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events DISABLE ROW LEVEL SECURITY;

-- Drop all known and potentially conflicting policies for leads table
DROP POLICY IF EXISTS "Anonymous can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated can read leads" ON public.leads;

-- Drop all known and potentially conflicting policies for bonus_signups table
DROP POLICY IF EXISTS "Anonymous can insert bonus signups" ON public.bonus_signups;
DROP POLICY IF EXISTS "Authenticated can read bonus signups" ON public.bonus_signups;

-- Drop all known and potentially conflicting policies for analytics_events table,
-- including the one from the error message
DROP POLICY IF EXISTS "Anonymous can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated can read analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can read analytics events" ON public.analytics_events; -- Policy name from the error message

-- Re-enable RLS for all affected tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Recreate policies for leads table
CREATE POLICY "Anonymous can insert leads"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate policies for bonus_signups table
CREATE POLICY "Anonymous can insert bonus signups"
  ON public.bonus_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read bonus signups"
  ON public.bonus_signups
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate policies for analytics_events table
CREATE POLICY "Anonymous can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read analytics events"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (true);
```