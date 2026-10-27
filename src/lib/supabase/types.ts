// --- Напоминания (задачи + привычки) ---

export type Task = {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  task_date: string; // YYYY-MM-DD
  task_time: string | null; // HH:MM
  reminded_at: string | null;
  position: number;
  created_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  title: string;
  archived: boolean;
  reminder_time: string | null; // HH:MM
  position: number;
  created_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  created_at: string;
};

// --- Ежедневник ---

export type JournalEntry = {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  content: string;
  mood: string | null;
  updated_at: string;
};

// --- Вес ---

export type BodyLog = {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  weight_kg: number | null;
  created_at: string;
};

// --- Рацион ---

export type MealSlotDb = "breakfast" | "lunch" | "snack" | "dinner" | "sweet";
export type MealStatus = "pending" | "eaten" | "half" | "skipped";

export type MealLog = {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  meal_slot: MealSlotDb;
  status: MealStatus;
  recipe_id: string | null; // переопределение после «Заменить»
  created_at: string;
  updated_at: string;
};

// --- Трекер «Без сахара» ---

export type SugarFreeDay = {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  soda: boolean;
  sweets_over_limit: boolean;
  fastfood: boolean;
  alcohol: boolean;
  updated_at: string;
};

// --- Тренировки ---

export type WorkoutDayType = "upper" | "lower";

export type WorkoutSession = {
  id: string;
  user_id: string;
  session_date: string; // YYYY-MM-DD
  day_type: WorkoutDayType;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  total_tonnage: number | null;
  created_at: string;
};

export type WorkoutSet = {
  id: string;
  user_id: string;
  session_id: string;
  exercise_id: string;
  set_index: number;
  weight_kg: number | null;
  reps: number | null;
  created_at: string;
};

// --- Push-уведомления и настройки ---

export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
};

export type UserSettings = {
  user_id: string;
  daily_reminder_time: string | null; // HH:MM
  daily_reminder_enabled: boolean;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: Task;
        Insert: Partial<Task> & { title: string; user_id: string };
        Update: Partial<Task>;
        Relationships: [];
      };
      habits: {
        Row: Habit;
        Insert: Partial<Habit> & { title: string; user_id: string };
        Update: Partial<Habit>;
        Relationships: [];
      };
      habit_logs: {
        Row: HabitLog;
        Insert: Partial<HabitLog> & {
          habit_id: string;
          user_id: string;
          log_date: string;
        };
        Update: Partial<HabitLog>;
        Relationships: [];
      };
      journal_entries: {
        Row: JournalEntry;
        Insert: Partial<JournalEntry> & {
          user_id: string;
          entry_date: string;
          content: string;
        };
        Update: Partial<JournalEntry>;
        Relationships: [];
      };
      body_logs: {
        Row: BodyLog;
        Insert: Partial<BodyLog> & { user_id: string; entry_date: string };
        Update: Partial<BodyLog>;
        Relationships: [];
      };
      meal_logs: {
        Row: MealLog;
        Insert: Partial<MealLog> & { user_id: string; log_date: string; meal_slot: MealSlotDb };
        Update: Partial<MealLog>;
        Relationships: [];
      };
      sugar_free_days: {
        Row: SugarFreeDay;
        Insert: Partial<SugarFreeDay> & { user_id: string; log_date: string };
        Update: Partial<SugarFreeDay>;
        Relationships: [];
      };
      workout_sessions: {
        Row: WorkoutSession;
        Insert: Partial<WorkoutSession> & { user_id: string; session_date: string; day_type: WorkoutDayType };
        Update: Partial<WorkoutSession>;
        Relationships: [];
      };
      workout_sets: {
        Row: WorkoutSet;
        Insert: Partial<WorkoutSet> & { user_id: string; session_id: string; exercise_id: string; set_index: number };
        Update: Partial<WorkoutSet>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: PushSubscriptionRow;
        Insert: Partial<PushSubscriptionRow> & {
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
        };
        Update: Partial<PushSubscriptionRow>;
        Relationships: [];
      };
      user_settings: {
        Row: UserSettings;
        Insert: Partial<UserSettings> & { user_id: string };
        Update: Partial<UserSettings>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
