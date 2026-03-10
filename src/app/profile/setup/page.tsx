import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { SetupFlowClient } from "./SetupFlowClient";

export default async function ProfileSetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const existingPlayer = await getPlayerByUserId(user.id);
  if (existingPlayer) {
    redirect("/profile");
  }

  return <SetupFlowClient userId={user.id} />;
}
