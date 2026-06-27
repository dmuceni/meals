create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null unique,
  email text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists diets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  diet_json jsonb not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists one_active_diet_per_profile
  on diets(profile_id)
  where is_active = true;

create table if not exists food_items (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null unique,
  display_name text not null,
  category text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists food_combinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  items jsonb not null,
  macros jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists food_substitutions (
  id uuid primary key default gen_random_uuid(),
  group_key text not null,
  source_food_id uuid references food_items(id) on delete set null,
  target_food_id uuid references food_items(id) on delete set null,
  source_quantity numeric,
  source_unit text,
  target_quantity numeric,
  target_unit text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists shopping_checked_items (
  profile_id uuid not null references profiles(id) on delete cascade,
  diet_id uuid not null references diets(id) on delete cascade,
  item_key text not null,
  checked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (profile_id, diet_id, item_key)
);

create table if not exists image_assets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  blob_url text not null,
  kind text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
