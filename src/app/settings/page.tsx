import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsPage } from "@/components/SettingsPage";

export default async function Settings() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <SettingsPage userId={user.id} email={user.email ?? ""} />;
}
