import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import { expireStaleRequests } from "@/lib/db/partner-requests";

export async function POST(request: NextRequest) {
  try {
    // Allow internal cron calls via secret header OR admin users
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (!cronSecret || !expectedSecret || cronSecret !== expectedSecret) {
      // Fall back to admin auth check
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (!(await isAdmin(user.id))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const expired = await expireStaleRequests();

    return NextResponse.json({
      expired: expired.length,
      ids: expired.map((r) => r.id),
    });
  } catch (error) {
    console.error("Expire requests error:", error);
    return NextResponse.json(
      { error: "Failed to expire stale requests" },
      { status: 500 }
    );
  }
}
