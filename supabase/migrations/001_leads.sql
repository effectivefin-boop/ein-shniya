-- Leads capture for עין שנייה (ein-shniya)
-- Run this in Supabase SQL Editor (project gdyrytpwuptobmrnimuo).
--
-- Admin reads: use the service role from the Next.js API/server (preferred),
-- or add an authenticated SELECT policy for JWT email = 'effective.fin@gmail.com'
-- if you later switch to user-JWT reads. Anon has no SELECT and no INSERT policies;
-- inserts go through the server with SUPABASE_SERVICE_ROLE_KEY.

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  calculator_id text not null,
  name text not null,
  phone text null,
  email text null,
  privacy_accepted boolean not null,
  marketing_opt_in boolean not null default false,
  inputs jsonb not null,
  results jsonb not null,
  traffic_source text null,
  utm_source text null,
  utm_medium text null,
  utm_campaign text null,
  referrer text null,
  constraint leads_phone_or_email_chk check (
    (phone is not null and length(trim(phone)) > 0)
    or (email is not null and length(trim(email)) > 0)
  ),
  constraint leads_traffic_source_chk check (
    traffic_source is null
    or traffic_source in ('google', 'facebook', 'direct', 'other')
  )
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_calculator_id_idx on public.leads (calculator_id);

alter table public.leads enable row level security;

-- Intentionally no policies for anon/authenticated.
-- Inserts and admin reads use the service role (bypasses RLS).
-- Optional future policy example (do not enable unless using user JWT reads):
--   create policy "admin_select_own_email"
--     on public.leads for select to authenticated
--     using ((auth.jwt() ->> 'email') = 'effective.fin@gmail.com');

comment on table public.leads is
  'Calculator lead submissions. RLS on; no anon policies. API uses service role. Admin email allowlist: effective.fin@gmail.com';
