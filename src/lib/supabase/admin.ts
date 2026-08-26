import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Только для серверного кода (API routes / cron) — обходит RLS через service_role.
// Никогда не импортировать из клиентских компонентов.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
