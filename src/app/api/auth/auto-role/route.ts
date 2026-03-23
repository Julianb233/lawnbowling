import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { shouldBeAdmin } from "@/lib/auth/auto-admin";
import { apiError } from "@/lib/api-error-handler";

/**
 * POST /api/auth/auto-role
 *
 * Called after client-side player creation (auto-confirmed signup).
 * Checks if the authenticated user's email matches ADMIN_EMAILS
 * and promotes their player record to admin if so.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!shouldBeAdmin(user.email)) {
    return NextResponse.json({ role: "player" });
  }

  const { error } = await supabase
    .from("players")
    .update({ role: "admin" })
    .eq("user_id", user.id);

  if (error) {
    return apiError(error, "auth/auto-role", 500);
  }

  return NextResponse.json({ role: "admin" });
}
