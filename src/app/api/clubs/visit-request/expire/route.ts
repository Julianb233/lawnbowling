import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * REQ-12-11: Auto-expire visit requests older than 30 days with status 'pending'.
 * Callable by Vercel cron or manually.
 */
export async function POST(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("visit_requests")
      .update({ status: "expired" })
      .eq("status", "pending")
      .lt("created_at", thirtyDaysAgo.toISOString())
      .select("id");

    if (error) {
      console.error("Failed to expire visit requests:", error);
      return NextResponse.json({ error: "Failed to expire requests" }, { status: 500 });
    }

    return NextResponse.json({ expired: data?.length ?? 0 });
  } catch (error) {
    console.error("Visit request expire error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
