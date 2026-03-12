import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/auth/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/cron/visit-requests
 *
 * Expire stale visit requests where expires_at (or requested_date) has passed.
 * Runs hourly via Vercel cron.
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
  return handleExpire(request);
}

export async function POST(request: NextRequest) {
  return handleExpire(request);
}

async function handleExpire(request: NextRequest) {
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
    const now = new Date().toISOString();

    // Expire visit requests where expires_at has passed
    const { data: expiredByDate, error: err1 } = await supabase
      .from("visit_requests")
      .update({ status: "expired" })
      .eq("status", "pending")
      .lt("expires_at", now)
      .not("expires_at", "is", null)
      .select("id");

    if (err1) {
      console.error("Failed to expire visit requests by expires_at:", err1);
    }

    // Also expire requests where requested_date has passed (no expires_at set)
    const { data: expiredByReqDate, error: err2 } = await supabase
      .from("visit_requests")
      .update({ status: "expired" })
      .eq("status", "pending")
      .is("expires_at", null)
      .lt("requested_date", now)
      .select("id");

    if (err2) {
      console.error("Failed to expire visit requests by requested_date:", err2);
    }

    const expiredCount =
      (expiredByDate?.length ?? 0) + (expiredByReqDate?.length ?? 0);

    return NextResponse.json({
      expired: expiredCount,
      ids: [
        ...(expiredByDate?.map((r) => r.id) ?? []),
        ...(expiredByReqDate?.map((r) => r.id) ?? []),
      ],
    });
  } catch (error) {
    console.error("Cron visit-requests error:", error);
    return NextResponse.json(
      { error: "Failed to expire stale visit requests" },
      { status: 500 }
    );
  }
}
