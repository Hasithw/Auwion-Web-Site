-- Auwion — profiles table
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)

create table if not exists profiles (
  id uuid references auth.users primary key,
  full_name text,
  company_name text,
  odoo_client_id text,               -- filled in once matched to an Odoo partner record
  match_status text default 'pending', -- 'pending' | 'matched' | 'manual_review'
  created_at timestamp with time zone default now()
);

-- Row-level security: a user can only see and edit their own profile row
alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Matching new signups to Odoo client records is deliberately left as a
-- manual/semi-automated step. A simple starting approach:
--   1. On signup, store the user's email domain and company_name (done by
--      the client already, see assets/supabase-client.js).
--   2. A scheduled Edge Function (or a person on your team) compares that
--      against Odoo's partner list and fills in odoo_client_id, setting
--      match_status to 'matched'.
--   3. Anything that doesn't match cleanly (e.g. a personal email address)
--      stays 'pending' / gets flagged 'manual_review' for a human to check.
