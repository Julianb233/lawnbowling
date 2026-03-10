export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { AdminWaiversClient } from "./AdminWaiversClient";

export default async function AdminWaiversPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check admin role via user metadata
  const { data: profile } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const isAdmin = user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin";

  if (!isAdmin) {
    redirect("/");
  }

  return <AdminWaiversClient />;
}
