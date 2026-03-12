export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { MonitoringDashboard } from "./MonitoringDashboard";

export default async function MonitoringPage() {
  await requireAdmin();

  const svc = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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

  return (
    <MonitoringDashboard
      slowQueries={slowQueries}
      connections={connections}
      tableSizes={tableSizes}
      indexUsage={indexUsage}
      rlsStatus={rlsStatus}
      auditLog={auditLog}
      alerts={alerts}
    />
  );
}
