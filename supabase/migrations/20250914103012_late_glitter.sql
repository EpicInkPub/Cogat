-- Ensure we're on the actual table in public
alter table public.analytics_events enable row level security;

-- 1) Drop ALL existing policies on this table (unknown names ok)
do $$
declare r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname='public' and tablename='analytics_events'
  loop
    execute format('drop policy if exists %I on public.analytics_events;', r.policyname);
  end loop;
end $$ language plpgsql;

-- 2) Make sure roles have required privileges (RLS needs BOTH privilege + policy)
grant usage on schema public to anon, authenticated;
grant insert, select on table public.analytics_events to anon, authenticated;

-- 3) Minimal, correct policies
create policy "ae_insert_anon_auth"
on public.analytics_events
as permissive
for insert
to anon, authenticated
with check (true);

create policy "ae_select_auth"
on public.analytics_events
as permissive
for select
to authenticated
using (true);

-- 4) Force PostgREST to reload its schema cache
notify pgrst, 'reload schema';
