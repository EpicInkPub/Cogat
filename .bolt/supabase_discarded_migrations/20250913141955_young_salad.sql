```sql
-- Disable RLS for all affected tables to allow dropping and recreating policies
ALTER TABLE public.analytics_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_signups DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies by their exact names
DROP POLICY IF EXISTS "Anonymous can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated can read analytics events" ON public.analytics_events;

DROP POLICY IF EXISTS "Anonymous can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated can read leads" ON public.leads;

DROP POLICY IF EXISTS "Anonymous can insert bonus signups" ON public.bonus_signups;
DROP POLICY IF EXISTS "Authenticated can read bonus signups" ON public.bonus_signups;

-- Re-enable RLS for all affected tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_signups ENABLE ROW LEVEL SECURITY;

-- Recreate policies for analytics_events table
CREATE POLICY "Allow anonymous insert for analytics_events"
  ON public.analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read for analytics_events"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate policies for leads table
CREATE POLICY "Allow anonymous insert for leads"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read for leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate policies for bonus_signups table
CREATE POLICY "Allow anonymous insert for bonus_signups"
  ON public.bonus_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read for bonus_signups"
  ON public.bonus_signups
  FOR SELECT
  TO authenticated
  USING (true);
```