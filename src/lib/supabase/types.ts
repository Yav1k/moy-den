export type Task = {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  task_date: string; // YYYY-MM-DD
  task_time: string | null; // HH:MM
  position: number;
  created_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  title: string;
  archived: boolean;
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

export type JournalEntry = {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  content: string;
  updated_at: string;
};

export type ExerciseKind = "reps" | "duration";

export type Exercise = {
  id: string;
  user_id: string;
  title: string;
  kind: ExerciseKind;
  position: number;
  archived: boolean;
  created_at: string;
};

export type ExerciseSet = {
  id: string;
  user_id: string;
  exercise_id: string;
  entry_date: string; // YYYY-MM-DD
  value: number; // повторения (reps) или секунды (duration)
  position: number;
  created_at: string;
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
      exercises: {
        Row: Exercise;
        Insert: Partial<Exercise> & { title: string; user_id: string; kind: ExerciseKind };
        Update: Partial<Exercise>;
        Relationships: [];
      };
      exercise_sets: {
        Row: ExerciseSet;
        Insert: Partial<ExerciseSet> & {
          user_id: string;
          exercise_id: string;
          entry_date: string;
          value: number;
        };
        Update: Partial<ExerciseSet>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
