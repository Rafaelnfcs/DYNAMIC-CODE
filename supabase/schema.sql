create extension if not exists pgcrypto;

create table if not exists plans (
  id text primary key,
  name text not null,
  qr_limit integer not null,
  price_cents integer not null default 0,
  active boolean not null default true,
  created_at timestamptz default now()
);
insert into plans(id,name,qr_limit,price_cents) values
('free','Grátis',3,0),('basic','Básico',25,2990),('pro','Pro',200,7990)
on conflict (id) do update set name=excluded.name,qr_limit=excluded.qr_limit,price_cents=excluded.price_cents;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'client' check(role in ('admin','client')),
  plan text not null default 'free' references plans(id),
  status text not null default 'active' check(status in ('active','suspended')),
  created_at timestamptz default now()
);
create table if not exists qr_codes (id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles(id) on delete cascade, name text not null, slug text unique not null, destination_url text not null, active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists scans (id bigint generated always as identity primary key, qr_code_id uuid not null references qr_codes(id) on delete cascade, scanned_at timestamptz default now(), user_agent text, referer text);

alter table profiles enable row level security; alter table qr_codes enable row level security; alter table scans enable row level security; alter table plans enable row level security;
create policy "plans public read" on plans for select using (true);
create policy "profile self read" on profiles for select using (auth.uid()=id);
create policy "qr owner all" on qr_codes for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "scan owner read" on scans for select using (exists(select 1 from qr_codes q where q.id=qr_code_id and q.user_id=auth.uid()));
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')); return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users; create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
