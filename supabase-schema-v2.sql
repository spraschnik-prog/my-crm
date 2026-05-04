-- Run this in Supabase SQL Editor (additions to existing schema)

-- Leads pipeline
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  source text,
  stage text not null default 'new' check (stage in ('new','contacted','qualified','proposal','won','lost')),
  expected_value numeric(10,2) default 0,
  notes text,
  created_at timestamptz default now()
);

-- Schedule / calendar events
create table if not exists schedule_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  client_id uuid references clients(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  event_type text not null default 'task' check (event_type in ('meeting','call','followup','task')),
  start_at timestamptz not null,
  end_at timestamptz,
  status text not null default 'pending' check (status in ('pending','completed','cancelled')),
  created_at timestamptz default now()
);

-- Expenses
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text not null default 'other' check (category in ('office','software','travel','marketing','equipment','meals','utilities','other')),
  amount numeric(10,2) not null default 0,
  expense_date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

-- Payments (individual payment records linked to invoices)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  amount numeric(10,2) not null,
  payment_date date not null default current_date,
  payment_method text default 'other' check (payment_method in ('cash','check','credit_card','bank_transfer','other')),
  notes text,
  created_at timestamptz default now()
);
