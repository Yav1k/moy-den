import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MeditationPage } from "@/components/MeditationPage";

export default async function Meditation() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <MeditationPage />;
}
