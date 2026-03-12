import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/auth/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/cron/tournament-cleanup
 *
 * Mark tournaments still in 'registration' status whose starts_at is more than
 * 24 hours in the past as 'cancelled'. Runs daily at 4am UTC.
 */
function verifyCronAuth(request: NextRequest): boolean {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return false;
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  if (bearer === expectedSecret) return true;
  const cronSecret = request.headers.get("x-cron-secret");
  return cronSecret === expectedSecret;
}

export async function GET(request: NextRequest) {
  return handleCleanup(request);
}

export async function POST(request: NextRequest) {
  return handleCleanup(request);
}

async function handleCleanup(request: NextRequest) {
  try {
    const expectedSecret = process.env.CRON_SECRET;

    if (!verifyCronAuth(request)) {
      const supabase = await createServerClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!(await isAdmin(user.id))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data, error } = await supabase
      .from("tournaments")
      .update({ status: "cancelled" })
      .eq("status", "registration")
      .lt("starts_at", twentyFourHoursAgo.toISOString())
      .not("starts_at", "is", null)
      .select("id, name");

    if (error) {
      console.error("Failed to clean up stale tournaments:", error);
      return NextResponse.json(
        { error: "Failed to clean up tournaments" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      cancelled: data?.length ?? 0,
      tournaments: data ?? [],
    });
  } catch (error) {
    console.error("Cron tournament-cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to clean up stale tournaments" },
      { status: 500 }
    );
  }
}
