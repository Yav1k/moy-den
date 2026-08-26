import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JournalPage } from "@/components/JournalPage";

export default async function Journal() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <JournalPage userId={user.id} />;
}
