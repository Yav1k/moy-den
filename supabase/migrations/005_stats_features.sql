-- Миграция: настроение в дневнике, вес, цели, еженедельный обзор.
-- Выполните в Supabase Studio -> SQL Editor -> New query (один раз).

alter table public.journal_entries add column if not exists mood text;

create table if not exists public.body_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  weight_kg numeric,
  created_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  unit text not null default '',
  target_value numeric not null check (target_value > 0),
  current_value numeric not null default 0,
  archived boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.user_settings add column if not exists weekly_review_enabled boolean not null default true;
alter table public.user_settings add column if not exists weekly_review_time time;

create index if not exists body_logs_user_date_idx on public.body_logs (user_id, entry_date);
create index if not exists goals_user_idx on public.goals (user_id, archived);

alter table public.body_logs enable row level security;
alter table public.goals enable row level security;

create policy "body_logs_select_own" on public.body_logs for select using (auth.uid() = user_id);
create policy "body_logs_insert_own" on public.body_logs for insert with check (auth.uid() = user_id);
create policy "body_logs_update_own" on public.body_logs for update using (auth.uid() = user_id);
create policy "body_logs_delete_own" on public.body_logs for delete using (auth.uid() = user_id);

create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);
