import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GoalsPage } from "@/components/GoalsPage";

export default async function Goals() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <GoalsPage userId={user.id} />;
}
