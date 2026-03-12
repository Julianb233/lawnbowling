import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/auth/admin";

/**
 * GET /api/admin/monitoring
 *
 * Returns database monitoring data from pre-built monitoring views.
 * Requires admin role authentication.
 * Uses service role to query system-level views (pg_stat_activity etc.).
 */
export async function GET() {
  try {
    // Auth check — must be logged-in admin
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const admin = await isAdmin(user.id);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Service role client to access monitoring views
    const svc = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Query all monitoring views in parallel.
    // Views (monitor_*) are exposed via PostgREST just like tables.
    const [slowQueries, connections, tableSizes, indexUsage, rlsStatus, auditLog, alerts] =
      await Promise.all([
        svc.from("monitor_slow_queries").select("*").limit(50).then((r) => r.data ?? []),
        svc.from("monitor_connections").select("*").then((r) => r.data ?? []),
        svc.from("monitor_table_sizes").select("*").then((r) => r.data ?? []),
        svc.from("monitor_index_usage").select("*").then((r) => r.data ?? []),
        svc.from("monitor_rls_status").select("*").then((r) => r.data ?? []),
        svc
          .from("audit_log")
          .select("*")
          .order("performed_at", { ascending: false })
          .limit(50)
          .then((r) => r.data ?? []),
        svc
          .from("monitoring_alerts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20)
          .then((r) => r.data ?? []),
      ]);

    return NextResponse.json({
      slowQueries,
      connections,
      tableSizes,
      indexUsage,
      rlsStatus,
      auditLog,
      alerts,
    });
  } catch (error) {
    console.error("Monitoring API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch monitoring data" },
      { status: 500 }
    );
  }
}
