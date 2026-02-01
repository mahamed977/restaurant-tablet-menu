-- Enable required extensions
create extension if not exists "pgcrypto";

-- Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Menu items table
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  is_available boolean not null default true,
  image_url text,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- Menu meta for versioning
create table if not exists public.menu_meta (
  id int primary key,
  menu_version bigint not null default 1,
  updated_at timestamptz not null default now()
);

-- Audit log
create table if not exists public.admin_audit (
  id bigint generated always as identity primary key,
  user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

-- Roles table to map auth users to role
create table if not exists public.admin_roles (
  user_id uuid primary key,
  role text not null check (role in ('admin','staff')),
  created_at timestamptz not null default now()
);

-- RLS (locked down; service role bypasses)
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_meta enable row level security;
alter table public.admin_audit enable row level security;
alter table public.admin_roles enable row level security;

-- Function to bump version atomically
create or replace function public.increment_menu_version()
returns void
language plpgsql
as $$
begin
  update public.menu_meta
  set menu_version = menu_version + 1, updated_at = now()
  where id = 1;
end;
$$;

-- Seed data
insert into public.menu_meta (id, menu_version)
values (1, 1)
on conflict (id) do nothing;

insert into public.categories (id, name, sort_order, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'Starters', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'Mains', 2, true)
on conflict (id) do nothing;

insert into public.menu_items (id, category_id, name, description, price, is_available, sort_order)
values
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'Bruschetta', 'Tomato, basil, toasted bread', 8.50, true, 1),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'Soup of the Day', 'Ask your server', 7.00, true, 2),
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '22222222-2222-2222-2222-222222222222', 'Grilled Salmon', 'Lemon butter sauce', 19.00, true, 1),
  ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222222', 'Pasta Primavera', 'Seasonal vegetables, parmesan', 15.50, true, 2)
on conflict (id) do nothing;
