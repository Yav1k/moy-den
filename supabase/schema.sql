-- Схема базы данных для приложения "Мой день".
-- Выполните этот файл целиком в Supabase Studio -> SQL Editor -> New query.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  task_date date not null default current_date,
  task_time time,
  reminded_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  archived boolean not null default false,
  reminder_time time,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  log_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  content text not null default '',
  mood text,
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

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

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  daily_reminder_time time,
  daily_reminder_enabled boolean not null default true,
  weekly_review_enabled boolean not null default true,
  weekly_review_time time,
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_date_idx on public.tasks (user_id, task_date);
create index if not exists habits_user_idx on public.habits (user_id, archived);
create index if not exists habit_logs_user_date_idx on public.habit_logs (user_id, log_date);
create index if not exists journal_user_date_idx on public.journal_entries (user_id, entry_date);
create index if not exists exercises_user_idx on public.exercises (user_id, archived);
create index if not exists exercise_sets_user_exercise_date_idx
  on public.exercise_sets (user_id, exercise_id, entry_date);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
create index if not exists body_logs_user_date_idx on public.body_logs (user_id, entry_date);
create index if not exists goals_user_idx on public.goals (user_id, archived);

-- Row Level Security: каждый пользователь видит и меняет только свои строки.

alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.journal_entries enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_sets enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.user_settings enable row level security;
alter table public.body_logs enable row level security;
alter table public.goals enable row level security;

create policy "tasks_select_own" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete using (auth.uid() = user_id);

create policy "habits_select_own" on public.habits for select using (auth.uid() = user_id);
create policy "habits_insert_own" on public.habits for insert with check (auth.uid() = user_id);
create policy "habits_update_own" on public.habits for update using (auth.uid() = user_id);
create policy "habits_delete_own" on public.habits for delete using (auth.uid() = user_id);

create policy "habit_logs_select_own" on public.habit_logs for select using (auth.uid() = user_id);
create policy "habit_logs_insert_own" on public.habit_logs for insert with check (auth.uid() = user_id);
create policy "habit_logs_update_own" on public.habit_logs for update using (auth.uid() = user_id);
create policy "habit_logs_delete_own" on public.habit_logs for delete using (auth.uid() = user_id);

create policy "journal_select_own" on public.journal_entries for select using (auth.uid() = user_id);
create policy "journal_insert_own" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "journal_update_own" on public.journal_entries for update using (auth.uid() = user_id);
create policy "journal_delete_own" on public.journal_entries for delete using (auth.uid() = user_id);

create policy "exercises_select_own" on public.exercises for select using (auth.uid() = user_id);
create policy "exercises_insert_own" on public.exercises for insert with check (auth.uid() = user_id);
create policy "exercises_update_own" on public.exercises for update using (auth.uid() = user_id);
create policy "exercises_delete_own" on public.exercises for delete using (auth.uid() = user_id);

create policy "exercise_sets_select_own" on public.exercise_sets for select using (auth.uid() = user_id);
create policy "exercise_sets_insert_own" on public.exercise_sets for insert with check (auth.uid() = user_id);
create policy "exercise_sets_update_own" on public.exercise_sets for update using (auth.uid() = user_id);
create policy "exercise_sets_delete_own" on public.exercise_sets for delete using (auth.uid() = user_id);

create policy "push_subscriptions_select_own" on public.push_subscriptions for select using (auth.uid() = user_id);
create policy "push_subscriptions_insert_own" on public.push_subscriptions for insert with check (auth.uid() = user_id);
create policy "push_subscriptions_delete_own" on public.push_subscriptions for delete using (auth.uid() = user_id);

create policy "user_settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
create policy "user_settings_insert_own" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "user_settings_update_own" on public.user_settings for update using (auth.uid() = user_id);

create policy "body_logs_select_own" on public.body_logs for select using (auth.uid() = user_id);
create policy "body_logs_insert_own" on public.body_logs for insert with check (auth.uid() = user_id);
create policy "body_logs_update_own" on public.body_logs for update using (auth.uid() = user_id);
create policy "body_logs_delete_own" on public.body_logs for delete using (auth.uid() = user_id);

create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

-- Миграция 006: Рацион, трекер «Без сахара», тренировки.

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
