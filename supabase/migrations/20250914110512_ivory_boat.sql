```sql
    -- Create the 'leads' table
    create table public.leads (
      id uuid default gen_random_uuid() not null primary key,
      first_name text not null,
      last_name text not null,
      email text not null,
      phone text not null,
      package_selected text not null,
      grade_selected text not null,
      source text default 'website'::text,
      session_id text,
      created_at timestamp with time zone default now()
    );

    -- Indexes for 'leads'
    create index leads_created_at_idx on public.leads using btree (created_at desc);
    create index leads_email_idx on public.leads using btree (email);

    -- Enable RLS for 'leads'
    alter table public.leads enable row level security;

    -- Policies for 'leads'
    create policy "Anonymous can insert leads"
    on public.leads
    as permissive
    for insert
    to anon, authenticated
    with check (true);

    create policy "Authenticated can read leads"
    on public.leads
    as permissive
    for select
    to authenticated
    using (true);

    -- Create the 'bonus_signups' table
    create table public.bonus_signups (
      id uuid default gen_random_uuid() not null primary key,
      email text not null,
      session_id text,
      created_at timestamp with time zone default now()
    );

    -- Indexes for 'bonus_signups'
    create index bonus_signups_created_at_idx on public.bonus_signups using btree (created_at desc);
    create index bonus_signups_email_idx on public.bonus_signups using btree (email);

    -- Enable RLS for 'bonus_signups'
    alter table public.bonus_signups enable row level security;

    -- Policies for 'bonus_signups'
    create policy "Anonymous can insert bonus signups"
    on public.bonus_signups
    as permissive
    for insert
    to anon, authenticated
    with check (true);

    create policy "Authenticated can read bonus signups"
    on public.bonus_signups
    as permissive
    for select
    to authenticated
    using (true);

    -- Create the 'analytics_events' table
    create table public.analytics_events (
      id uuid default gen_random_uuid() not null primary key,
      event_name text not null,
      properties jsonb default '{}'::jsonb,
      session_id text,
      user_id text,
      page_url text,
      user_agent text,
      created_at timestamp with time zone default now()
    );

    -- Indexes for 'analytics_events'
    create index analytics_events_created_at_idx on public.analytics_events using btree (created_at desc);
    create index analytics_events_event_idx on public.analytics_events using btree (event_name);
    create index analytics_events_session_idx on public.analytics_events using btree (session_id);

    -- Enable RLS for 'analytics_events'
    alter table public.analytics_events enable row level security;

    -- Policies for 'analytics_events'
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

    -- Force PostgREST to reload its schema cache
    notify pgrst, 'reload schema';
    ```