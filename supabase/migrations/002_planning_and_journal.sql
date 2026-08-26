-- Миграция: время у задач + дневник дня.
-- Выполните в Supabase Studio -> SQL Editor -> New query (один раз).

alter table public.tasks add column if not exists task_time time;

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index if not exists journal_user_date_idx on public.journal_entries (user_id, entry_date);

alter table public.journal_entries enable row level security;

create policy "journal_select_own" on public.journal_entries for select using (auth.uid() = user_id);
create policy "journal_insert_own" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "journal_update_own" on public.journal_entries for update using (auth.uid() = user_id);
create policy "journal_delete_own" on public.journal_entries for delete using (auth.uid() = user_id);
