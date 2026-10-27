import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkoutsPage } from "@/components/WorkoutsPage";

export default async function Workouts() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <WorkoutsPage userId={user.id} />;
}
