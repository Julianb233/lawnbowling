export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth/admin";
import { getReports } from "@/lib/db/reports";

export default async function ReportsPage() {
  await requireAdmin();
  const reports = await getReports();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Player Reports</h1>
        <p className="text-sm text-zinc-500">{reports.length} reports total</p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-400">No reports filed yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-100">
                    <span className="font-medium">
                      {report.reporter?.display_name || "Unknown"}
                    </span>
                    {" reported "}
                    <span className="font-medium text-red-400">
                      {report.reported?.display_name || "Unknown"}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Reason: {report.reason}
                  </p>
                  {report.details && (
                    <p className="text-sm text-zinc-400 mt-2">
                      {report.details}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    report.status === "pending"
                      ? "bg-amber-500/10 text-amber-400"
                      : report.status === "resolved"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : report.status === "dismissed"
                      ? "bg-zinc-500/10 text-zinc-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-2">
                {new Date(report.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
