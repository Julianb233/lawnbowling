import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/auth/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/cron/activity-cleanup
 *
 * Delete activity_feed entries older than 90 days.
 * Runs weekly on Sundays at 5am UTC.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret OR admin auth fallback
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (!cronSecret || !expectedSecret || cronSecret !== expectedSecret) {
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

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data, error } = await supabase
      .from("activity_feed")
      .delete()
      .lt("created_at", ninetyDaysAgo.toISOString())
      .select("id");

    if (error) {
      console.error("Failed to prune activity feed:", error);
      return NextResponse.json(
        { error: "Failed to prune activity feed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      deleted: data?.length ?? 0,
    });
  } catch (error) {
    console.error("Cron activity-cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to prune old activity feed entries" },
      { status: 500 }
    );
  }
}
