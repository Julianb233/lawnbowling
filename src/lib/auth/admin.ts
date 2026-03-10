import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: player } = await supabase
    .from("players")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!player || player.role !== "admin") redirect("/");

  return user;
}

export async function isAdmin(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select("role")
    .eq("user_id", userId)
    .single();

  return data?.role === "admin";
}
