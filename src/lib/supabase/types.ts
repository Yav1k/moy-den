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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
