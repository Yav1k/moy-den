import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NutritionPage } from "@/components/NutritionPage";

export default async function Nutrition() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <NutritionPage userId={user.id} />;
}
