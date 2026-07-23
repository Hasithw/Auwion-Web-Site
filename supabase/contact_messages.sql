-- Auwion — contact_messages table
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
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
