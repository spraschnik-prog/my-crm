-- Run this in Supabase SQL Editor

-- ─── Notifications ───────────────────────────────────────────────────────────
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,           -- 'overdue_invoice' | 'upcoming_event' | 'quote_expiring' | 'payment_received'
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz default now()
);

-- ─── Attachments ─────────────────────────────────────────────────────────────
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,    -- 'client' | 'invoice' | 'quote'
  entity_id uuid not null,
  file_name text not null,
  file_path text not null,      -- Supabase Storage path
  file_size bigint,
  mime_type text,
  uploaded_by text,
  created_at timestamptz default now()
);

-- ─── Team / user roles ────────────────────────────────────────────────────────
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin','member','viewer')),
  invited_email text,
  created_at timestamptz default now(),
  unique(user_id)
);

-- ─── Enable RLS on all tables (team access: any authenticated user) ───────────
alter table clients          enable row level security;
alter table products         enable row level security;
alter table quotes           enable row level security;
alter table quote_items      enable row level security;
alter table invoices         enable row level security;
alter table invoice_items    enable row level security;
alter table leads            enable row level security;
alter table schedule_events  enable row level security;
alter table expenses         enable row level security;
alter table payments         enable row level security;
alter table notifications    enable row level security;
alter table attachments      enable row level security;
alter table team_members     enable row level security;

-- ─── RLS policies: any authenticated user can read/write all data ─────────────
do $$ declare
  t text;
begin
  foreach t in array array[
    'clients','products','quotes','quote_items','invoices','invoice_items',
    'leads','schedule_events','expenses','payments','notifications',
    'attachments','team_members'
  ] loop
    execute format('
      create policy if not exists "%s_auth_all" on %s
      for all to authenticated using (true) with check (true);
    ', t, t);
  end loop;
end $$;

-- ─── Supabase Storage bucket for attachments ─────────────────────────────────
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy if not exists "attachments_auth_select" on storage.objects
  for select to authenticated using (bucket_id = 'attachments');

create policy if not exists "attachments_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'attachments');

create policy if not exists "attachments_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'attachments');
