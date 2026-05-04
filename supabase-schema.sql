-- Run this in your Supabase SQL editor

-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  address text,
  city text,
  state text,
  zip text,
  country text default 'US',
  notes text,
  created_at timestamptz default now()
);

-- Products / Services
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  unit text default 'each',
  created_at timestamptz default now()
);

-- Quotes
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  quote_number text not null unique,
  status text not null default 'draft' check (status in ('draft','sent','accepted','declined')),
  issue_date date not null default current_date,
  expiry_date date,
  notes text,
  subtotal numeric(10,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  created_at timestamptz default now()
);

-- Quote line items
create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references quotes(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0
);

-- Invoices
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  quote_id uuid references quotes(id) on delete set null,
  invoice_number text not null unique,
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue','cancelled')),
  issue_date date not null default current_date,
  due_date date,
  notes text,
  subtotal numeric(10,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  paid_amount numeric(10,2) not null default 0,
  created_at timestamptz default now()
);

-- Invoice line items
create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0
);

-- Sequence helpers for auto-numbering
create sequence if not exists quote_seq start 1000;
create sequence if not exists invoice_seq start 1000;

-- RLS policies (optional - enable if you add auth)
-- alter table clients enable row level security;
-- alter table products enable row level security;
-- alter table quotes enable row level security;
-- alter table quote_items enable row level security;
-- alter table invoices enable row level security;
-- alter table invoice_items enable row level security;
