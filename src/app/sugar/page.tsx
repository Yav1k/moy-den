import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SugarTrackerPage } from "@/components/SugarTrackerPage";

export default async function Sugar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <SugarTrackerPage userId={user.id} />;
}
