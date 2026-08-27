import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StatsPage } from "@/components/StatsPage";

export default async function Stats() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <StatsPage userId={user.id} />;
}
