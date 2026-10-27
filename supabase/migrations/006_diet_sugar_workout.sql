-- Миграция 006: Рацион, трекер «Без сахара», тренировки.
-- Выполните в Supabase Studio -> SQL Editor -> New query.
-- Старые таблицы (goals, exercises, exercise_sets) не трогаем и не удаляем —
-- в приложении они больше не используются, но данные остаются на месте.

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'snack', 'dinner', 'sweet')),
  status text not null default 'pending' check (status in ('pending', 'eaten', 'half', 'skipped')),
  recipe_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date, meal_slot)
);

create table if not exists public.sugar_free_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  soda boolean not null default false,
  sweets_over_limit boolean not null default false,
  fastfood boolean not null default false,
  alcohol boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_date date not null,
  day_type text not null check (day_type in ('upper', 'lower')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  total_tonnage numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id text not null,
  set_index integer not null,
  weight_kg numeric,
  reps integer,
  created_at timestamptz not null default now(),
  unique (session_id, exercise_id, set_index)
);

create index if not exists meal_logs_user_date_idx on public.meal_logs (user_id, log_date);
create index if not exists sugar_free_days_user_date_idx on public.sugar_free_days (user_id, log_date);
create index if not exists workout_sessions_user_date_idx on public.workout_sessions (user_id, session_date);
create index if not exists workout_sets_user_session_idx on public.workout_sets (user_id, session_id);
create index if not exists workout_sets_user_exercise_idx on public.workout_sets (user_id, exercise_id, created_at);

alter table public.meal_logs enable row level security;
alter table public.sugar_free_days enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;

create policy "meal_logs_select_own" on public.meal_logs for select using (auth.uid() = user_id);
create policy "meal_logs_insert_own" on public.meal_logs for insert with check (auth.uid() = user_id);
create policy "meal_logs_update_own" on public.meal_logs for update using (auth.uid() = user_id);
create policy "meal_logs_delete_own" on public.meal_logs for delete using (auth.uid() = user_id);

create policy "sugar_free_days_select_own" on public.sugar_free_days for select using (auth.uid() = user_id);
create policy "sugar_free_days_insert_own" on public.sugar_free_days for insert with check (auth.uid() = user_id);
create policy "sugar_free_days_update_own" on public.sugar_free_days for update using (auth.uid() = user_id);
create policy "sugar_free_days_delete_own" on public.sugar_free_days for delete using (auth.uid() = user_id);

create policy "workout_sessions_select_own" on public.workout_sessions for select using (auth.uid() = user_id);
create policy "workout_sessions_insert_own" on public.workout_sessions for insert with check (auth.uid() = user_id);
create policy "workout_sessions_update_own" on public.workout_sessions for update using (auth.uid() = user_id);
create policy "workout_sessions_delete_own" on public.workout_sessions for delete using (auth.uid() = user_id);

create policy "workout_sets_select_own" on public.workout_sets for select using (auth.uid() = user_id);
create policy "workout_sets_insert_own" on public.workout_sets for insert with check (auth.uid() = user_id);
create policy "workout_sets_update_own" on public.workout_sets for update using (auth.uid() = user_id);
create policy "workout_sets_delete_own" on public.workout_sets for delete using (auth.uid() = user_id);
