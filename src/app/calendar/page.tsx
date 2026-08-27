import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarPage } from "@/components/CalendarPage";

export default async function Calendar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <CalendarPage userId={user.id} />;
}
