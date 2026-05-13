-- Run this in the Supabase SQL editor

create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null default 0,
  image_url text not null default '',
  buy_link text not null default '',
  claimed_by text,
  created_at timestamptz not null default now()
);

alter table public.gifts enable row level security;

-- Anyone can read
drop policy if exists "Public read" on public.gifts;
create policy "Public read" on public.gifts
  for select using (true);

-- Anyone can claim/release/insert/update/delete (trust-based for a small family event)
-- Tighten these later if needed
drop policy if exists "Public write" on public.gifts;
create policy "Public write" on public.gifts
  for all using (true) with check (true);

-- Enable realtime
alter publication supabase_realtime add table public.gifts;
