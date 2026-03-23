import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { apiError } from "@/lib/api-error-handler";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Delete player record using user_id (auth UID), not id (player UUID)
  const { error } = await supabase
    .from("players")
    .delete()
    .eq("user_id", user.id);

  if (error) return apiError(error, "DELETE /api/account/delete", 400);

  // Delete the auth.users record using service role client (GDPR compliance)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    try {
      const adminClient = createServiceClient(supabaseUrl, serviceRoleKey);
      const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user.id);
      if (authDeleteError) {
        console.error("Failed to delete auth user:", authDeleteError.message);
        // Still return success — player data is deleted, auth cleanup is best-effort
      }
    } catch (err) {
      console.error("Auth user deletion error:", err);
    }
  } else {
    // Fallback: sign out only (service role key not configured)
    console.warn("SUPABASE_SERVICE_ROLE_KEY not configured — auth user not deleted");
    await supabase.auth.signOut();
  }

  return NextResponse.json({ ok: true });
}
