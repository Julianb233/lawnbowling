"use client";

import { useState } from "react";

interface MonitoringDashboardProps {
  slowQueries: Record<string, unknown>[];
  connections: Record<string, unknown>[];
  tableSizes: Record<string, unknown>[];
  indexUsage: Record<string, unknown>[];
  rlsStatus: Record<string, unknown>[];
  auditLog: Record<string, unknown>[];
  alerts: Record<string, unknown>[];
}

type Tab = "overview" | "queries" | "tables" | "rls" | "audit" | "alerts";

export function MonitoringDashboard({
  slowQueries,
  connections,
  tableSizes,
  indexUsage,
  rlsStatus,
  auditLog,
  alerts,
}: MonitoringDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "queries", label: "Slow Queries" },
    { key: "tables", label: "Tables & Indexes" },
    { key: "rls", label: "RLS Status" },
    { key: "audit", label: "Audit Log" },
    { key: "alerts", label: "Alerts" },
  ];

  const activeConnections = connections.reduce(
    (sum, c) => sum + (Number(c.count) || 0),
    0
  );

  const tablesWithoutRls = rlsStatus.filter(
    (r) => r.rls_enabled === false
  ).length;
  const totalTables = rlsStatus.length;

  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
          Database Monitoring
        </h1>
        <p className="text-sm text-[#3D5A3E]">
          Real-time database health and performance
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Active Connections" value={activeConnections} />
        <SummaryCard label="Slow Queries" value={slowQueries.length} />
        <SummaryCard
          label="RLS Coverage"
          value={`${totalTables > 0 ? Math.round(((totalTables - tablesWithoutRls) / totalTables) * 100) : 0}%`}
        />
        <SummaryCard
          label="Critical Alerts"
          value={criticalAlerts}
          variant={criticalAlerts > 0 ? "danger" : "default"}
        />
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-[#0A2E12]/10 pb-px scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors min-h-[44px] ${
              activeTab === tab.key
                ? "bg-white text-[#0A2E12] border border-b-0 border-[#0A2E12]/10"
                : "text-[#3D5A3E] hover:text-[#0A2E12]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && (
          <OverviewPanel connections={connections} alerts={alerts} />
        )}
        {activeTab === "queries" && (
          <SlowQueriesPanel queries={slowQueries} />
        )}
        {activeTab === "tables" && (
          <TablesPanel tableSizes={tableSizes} indexUsage={indexUsage} />
        )}
        {activeTab === "rls" && <RlsPanel rlsStatus={rlsStatus} />}
        {activeTab === "audit" && <AuditPanel auditLog={auditLog} />}
        {activeTab === "alerts" && <AlertsPanel alerts={alerts} />}
      </div>
    </div>
  );
}

/* ---------- Summary Card ---------- */

function SummaryCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string | number;
  variant?: "default" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
      <p className="text-xs text-[#3D5A3E] uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${
          variant === "danger" ? "text-red-600" : "text-[#0A2E12]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ---------- Overview Panel ---------- */

function OverviewPanel({
  connections,
  alerts,
}: {
  connections: Record<string, unknown>[];
  alerts: Record<string, unknown>[];
}) {
  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-[#3D5A3E] uppercase tracking-wider mb-4">
          Active Connections
        </h3>
        {connections.length === 0 ? (
          <p className="text-sm text-[#3D5A3E]">No connection data available</p>
        ) : (
          <div className="space-y-2">
            {connections.map((conn, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-[#3D5A3E]">
                  {String(conn.state || conn.datname || `Connection ${i + 1}`)}
                </span>
                <span className="font-mono font-medium text-[#0A2E12]">
                  {String(conn.count ?? conn.num_connections ?? "")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-[#3D5A3E] uppercase tracking-wider mb-4">
          Recent Alerts
        </h3>
        {recentAlerts.length === 0 ? (
          <p className="text-sm text-[#3D5A3E]">No alerts</p>
        ) : (
          <div className="space-y-2">
            {recentAlerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm border-b border-[#0A2E12]/5 pb-2 last:border-0"
              >
                <SeverityBadge severity={String(alert.severity)} />
                <div className="flex-1 min-w-0">
                  <p className="text-[#0A2E12] truncate">
                    {String(alert.message)}
                  </p>
                  <p className="text-xs text-[#3D5A3E]">
                    {formatTimestamp(alert.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Slow Queries Panel ---------- */

function SlowQueriesPanel({
  queries,
}: {
  queries: Record<string, unknown>[];
}) {
  if (queries.length === 0) {
    return (
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-8 text-center">
        <p className="text-[#3D5A3E]">No slow queries detected. Looking good!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queries.map((q, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <pre className="flex-1 text-xs text-[#0A2E12] overflow-x-auto whitespace-pre-wrap font-mono bg-[#0A2E12]/[0.03] rounded p-2">
              {String(q.query ?? q.queryid ?? "")}
            </pre>
            <div className="shrink-0 text-right">
              {q.mean_exec_time != null && (
                <p className="text-sm font-mono font-medium text-[#0A2E12]">
                  {Number(q.mean_exec_time).toFixed(1)}ms avg
                </p>
              )}
              {q.calls != null && (
                <p className="text-xs text-[#3D5A3E]">
                  {String(q.calls)} calls
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Tables & Indexes Panel ---------- */

function TablesPanel({
  tableSizes,
  indexUsage,
}: {
  tableSizes: Record<string, unknown>[];
  indexUsage: Record<string, unknown>[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-[#3D5A3E] uppercase tracking-wider mb-4">
          Table Sizes
        </h3>
        {tableSizes.length === 0 ? (
          <p className="text-sm text-[#3D5A3E]">No table size data</p>
        ) : (
          <div className="space-y-2">
            {tableSizes.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-mono text-[#0A2E12]">
                  {String(t.table_name ?? t.tablename ?? "")}
                </span>
                <span className="text-[#3D5A3E] font-mono">
                  {String(t.total_size ?? t.pg_total_relation_size ?? "")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-[#3D5A3E] uppercase tracking-wider mb-4">
          Index Usage
        </h3>
        {indexUsage.length === 0 ? (
          <p className="text-sm text-[#3D5A3E]">No index usage data</p>
        ) : (
          <div className="space-y-2">
            {indexUsage.map((idx, i) => {
              const hitRate = Number(idx.index_hit_rate ?? idx.idx_scan_pct ?? 0);
              return (
                <div key={i} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#0A2E12]">
                      {String(idx.table_name ?? idx.relname ?? "")}
                    </span>
                    <span
                      className={`font-mono font-medium ${
                        hitRate >= 95
                          ? "text-[#1B5E20]"
                          : hitRate >= 80
                            ? "text-amber-600"
                            : "text-red-600"
                      }`}
                    >
                      {hitRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[#0A2E12]/10">
                    <div
                      className={`h-full rounded-full ${
                        hitRate >= 95
                          ? "bg-[#1B5E20]"
                          : hitRate >= 80
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(hitRate, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- RLS Panel ---------- */

function RlsPanel({ rlsStatus }: { rlsStatus: Record<string, unknown>[] }) {
  if (rlsStatus.length === 0) {
    return (
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-8 text-center">
        <p className="text-[#3D5A3E]">No RLS data available</p>
      </div>
    );
  }

  const withRls = rlsStatus.filter((r) => r.rls_enabled === true);
  const withoutRls = rlsStatus.filter((r) => r.rls_enabled === false);

  return (
    <div className="space-y-6">
      {withoutRls.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h3 className="text-sm font-semibold text-red-800 uppercase tracking-wider mb-3">
            Tables WITHOUT RLS ({withoutRls.length})
          </h3>
          <div className="space-y-1">
            {withoutRls.map((t, i) => (
              <p key={i} className="text-sm font-mono text-red-700">
                {String(t.table_name ?? t.tablename ?? "")}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-[#3D5A3E] uppercase tracking-wider mb-3">
          Tables WITH RLS ({withRls.length})
        </h3>
        <div className="grid grid-cols-2 gap-1 lg:grid-cols-3">
          {withRls.map((t, i) => (
            <p key={i} className="text-sm font-mono text-[#1B5E20]">
              {String(t.table_name ?? t.tablename ?? "")}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Audit Log Panel ---------- */

function AuditPanel({ auditLog }: { auditLog: Record<string, unknown>[] }) {
  if (auditLog.length === 0) {
    return (
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-8 text-center">
        <p className="text-[#3D5A3E]">No audit log entries</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#0A2E12]/10 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#0A2E12]/10 bg-[#0A2E12]/[0.03]">
              <th className="text-left px-4 py-2 text-xs font-semibold text-[#3D5A3E] uppercase tracking-wider">
                Time
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-[#3D5A3E] uppercase tracking-wider">
                Action
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-[#3D5A3E] uppercase tracking-wider">
                Table
              </th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-[#3D5A3E] uppercase tracking-wider">
                User
              </th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map((entry, i) => (
              <tr
                key={i}
                className="border-b border-[#0A2E12]/5 last:border-0"
              >
                <td className="px-4 py-2 text-[#3D5A3E] whitespace-nowrap">
                  {formatTimestamp(entry.performed_at)}
                </td>
                <td className="px-4 py-2">
                  <ActionBadge action={String(entry.action ?? "")} />
                </td>
                <td className="px-4 py-2 font-mono text-[#0A2E12]">
                  {String(entry.table_name ?? "")}
                </td>
                <td className="px-4 py-2 text-[#3D5A3E] font-mono text-xs">
                  {String(entry.performed_by ?? entry.user_id ?? "system")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Alerts Panel ---------- */

function AlertsPanel({ alerts }: { alerts: Record<string, unknown>[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-8 text-center">
        <p className="text-[#3D5A3E]">No monitoring alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`rounded-xl border p-4 ${
            alert.severity === "critical"
              ? "border-red-200 bg-red-50"
              : alert.severity === "warning"
                ? "border-amber-200 bg-amber-50"
                : "border-[#0A2E12]/10 bg-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <SeverityBadge severity={String(alert.severity)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0A2E12]">
                {String(alert.alert_type ?? "")}
              </p>
              <p className="text-sm text-[#3D5A3E] mt-0.5">
                {String(alert.message ?? "")}
              </p>
              {alert.metadata != null && (
                <pre className="mt-2 text-xs font-mono text-[#3D5A3E] bg-[#0A2E12]/[0.03] rounded p-2 overflow-x-auto">
                  {JSON.stringify(alert.metadata, null, 2)}
                </pre>
              )}
              <p className="text-xs text-[#3D5A3E] mt-2">
                {formatTimestamp(alert.created_at)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Helpers ---------- */

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
        colors[severity] ?? "bg-[#0A2E12]/5 text-[#3D5A3E]"
      }`}
    >
      {severity}
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    INSERT: "bg-[#1B5E20]/10 text-[#1B5E20]",
    UPDATE: "bg-blue-50 text-blue-700",
    DELETE: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs font-mono font-medium ${
        colors[action.toUpperCase()] ?? "bg-[#0A2E12]/5 text-[#3D5A3E]"
      }`}
    >
      {action}
    </span>
  );
}

function formatTimestamp(value: unknown): string {
  if (!value) return "";
  try {
    return new Date(String(value)).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}
