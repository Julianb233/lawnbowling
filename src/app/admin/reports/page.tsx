export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth/admin";
import { getReports } from "@/lib/db/reports";

export default async function ReportsPage() {
  await requireAdmin();
  const reports = await getReports();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A2E12]">Player Reports</h1>
        <p className="text-sm text-[#3D5A3E]">{reports.length} reports total</p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-8 text-center">
          <p className="text-[#3D5A3E]">No reports filed yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-[#0A2E12]/10 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#0A2E12]">
                    <span className="font-medium">
                      {report.reporter?.display_name || "Unknown"}
                    </span>
                    {" reported "}
                    <span className="font-medium text-red-600">
                      {report.reported?.display_name || "Unknown"}
                    </span>
                  </p>
                  <p className="text-xs text-[#3D5A3E] mt-0.5">
                    Reason: {report.reason}
                  </p>
                  {report.details && (
                    <p className="text-sm text-[#3D5A3E] mt-2">
                      {report.details}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    report.status === "pending"
                      ? "bg-amber-50 text-amber-700"
                      : report.status === "resolved"
                      ? "bg-[#1B5E20]/5 text-[#1B5E20]"
                      : report.status === "dismissed"
                      ? "bg-[#0A2E12]/5 text-[#3D5A3E]"
                      : "bg-blue-50 text-[#1B5E20]"
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <p className="text-xs text-[#3D5A3E] mt-2">
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
