import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkoutPage } from "@/components/WorkoutPage";

export default async function Workout() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <WorkoutPage userId={user.id} />;
}
