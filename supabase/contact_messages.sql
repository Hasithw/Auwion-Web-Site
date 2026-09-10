-- Auwion — contact_messages table
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)
--
-- This table lives in the "Auwion Site" project (stodwjjgqzsqjnskyyka) —
-- already applied there directly. This file is kept as the reference copy
-- for future setups (e.g. if you ever migrate to a new project).

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  company_name text,
  interested_in text,
  message text,
  status text default 'new',   -- 'new' | 'read' | 'replied' | 'archived'
  created_at timestamp with time zone default now()
);

-- Row-level security: anyone (including anonymous site visitors) can submit
-- a message, but nobody can read, edit, or delete via the public API.
-- You'll read submissions from the Supabase dashboard (Table Editor) or via
-- an authenticated service role, not from the website itself.
alter table contact_messages enable row level security;

create policy "Anyone can submit a contact message"
  on contact_messages for insert
  with check (true);

-- No select/update/delete policy is created, so the anon key can only
-- insert — it can never read back the messages table.

-- ── Migration note ──────────────────────────────────────────────────
-- If contact_messages already exists in your project (i.e. you're not
-- running this file for the first time), the CREATE TABLE above is a
-- no-op and won't add the new `phone` column to your existing table.
-- Run this once, separately, to add it:
--
--   alter table contact_messages add column if not exists phone text;
