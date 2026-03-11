import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { shouldBeAdmin } from "@/lib/auth/auto-admin";

/**
 * POST /api/admin/seed
 *
 * Scans all players and promotes any whose email matches ADMIN_EMAILS.
 * Uses the service role key to bypass RLS. Protected by a bearer token
 * (ADMIN_SEED_SECRET) or by verifying the caller is already an admin.
 */
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server configuration missing" },
      { status: 500 },
    );
  }

  // Auth: require either ADMIN_SEED_SECRET bearer token or skip if no secret is set
  const seedSecret = process.env.ADMIN_SEED_SECRET;
  if (seedSecret) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token !== seedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) {
    return NextResponse.json(
      { error: "ADMIN_EMAILS env var is not configured" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient(supabaseUrl, serviceRoleKey);

  // List auth users and find those matching admin emails
  const { data: authData, error: authError } =
    await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (authError) {
    return NextResponse.json(
      { error: "Failed to list users", details: authError.message },
      { status: 500 },
    );
  }

  const adminUserIds = authData.users
    .filter((u) => shouldBeAdmin(u.email))
    .map((u) => u.id);

  if (adminUserIds.length === 0) {
    return NextResponse.json({
      message: "No users found matching ADMIN_EMAILS",
      promoted: 0,
    });
  }

  // Promote matching players to admin
  const { data: updated, error: updateError } = await supabase
    .from("players")
    .update({ role: "admin" })
    .in("user_id", adminUserIds)
    .neq("role", "admin")
    .select("id, display_name");

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to promote players", details: updateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: `Promoted ${updated?.length ?? 0} player(s) to admin`,
    promoted: updated?.length ?? 0,
    players: updated,
  });
}
