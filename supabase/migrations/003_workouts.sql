-- Миграция: утренние тренировки (упражнения + подходы).
-- Выполните в Supabase Studio -> SQL Editor -> New query (один раз).

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('reps', 'duration')),
  position integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  entry_date date not null default current_date,
  -- Повторения (kind = 'reps') или секунды (kind = 'duration')
  value integer not null check (value > 0),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists exercises_user_idx on public.exercises (user_id, archived);
create index if not exists exercise_sets_user_exercise_date_idx
  on public.exercise_sets (user_id, exercise_id, entry_date);

alter table public.exercises enable row level security;
alter table public.exercise_sets enable row level security;

create policy "exercises_select_own" on public.exercises for select using (auth.uid() = user_id);
create policy "exercises_insert_own" on public.exercises for insert with check (auth.uid() = user_id);
create policy "exercises_update_own" on public.exercises for update using (auth.uid() = user_id);
create policy "exercises_delete_own" on public.exercises for delete using (auth.uid() = user_id);

create policy "exercise_sets_select_own" on public.exercise_sets for select using (auth.uid() = user_id);
create policy "exercise_sets_insert_own" on public.exercise_sets for insert with check (auth.uid() = user_id);
create policy "exercise_sets_update_own" on public.exercise_sets for update using (auth.uid() = user_id);
create policy "exercise_sets_delete_own" on public.exercise_sets for delete using (auth.uid() = user_id);
