"use client";

import { useState, useEffect, useCallback } from "react";

interface Campaign {
  campaign_id: string;
  name: string;
  status: string;
  country_code: string | null;
  total_clubs: number;
  contacted: number;
  opened: number;
  replied: number;
  demos_scheduled: number;
  demos_completed: number;
  onboarded: number;
  declined: number;
  bounced: number;
}

interface OutreachRecord {
  id: string;
  club_id: string;
  status: string;
  contact_email: string | null;
  contact_name: string | null;
  last_contacted_at: string | null;
  next_followup_at: string | null;
  current_sequence_step: number;
  notes: string | null;
  clubs: {
    id: string;
    name: string;
    city: string;
    country: string;
    country_code: string;
  } | null;
  campaign: {
    id: string;
    name: string;
  } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  not_contacted: { label: "Not Contacted", color: "bg-zinc-100 text-zinc-600" },
  contacted: { label: "Contacted", color: "bg-blue-100 text-blue-700" },
  opened: { label: "Opened", color: "bg-cyan-100 text-cyan-700" },
  replied: { label: "Replied", color: "bg-emerald-100 text-emerald-700" },
  demo_scheduled: { label: "Demo Scheduled", color: "bg-amber-100 text-amber-700" },
  demo_completed: { label: "Demo Done", color: "bg-purple-100 text-purple-700" },
  onboarded: { label: "Onboarded", color: "bg-green-100 text-green-700" },
  declined: { label: "Declined", color: "bg-red-100 text-red-600" },
  bounced: { label: "Bounced", color: "bg-rose-100 text-rose-600" },
};

function StatusBadge({ status }: { status: string }) {
  const info = STATUS_LABELS[status] || { label: status, color: "bg-zinc-100 text-zinc-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-5">
      <p className="text-sm text-[#3D5A3E]">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#0A2E12]">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-[#3D5A3E]/60 mt-1">{sub}</p>}
    </div>
  );
}

export default function OutreachPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [outreach, setOutreach] = useState<OutreachRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"dashboard" | "clubs" | "campaigns">("dashboard");

  const fetchCampaigns = useCallback(async () => {
    const res = await fetch("/api/outreach/campaigns");
    if (res.ok) setCampaigns(await res.json());
  }, []);

  const fetchOutreach = useCallback(async () => {
    const params = new URLSearchParams({ limit: "100" });
    if (filter) params.set("status", filter);
    const res = await fetch(`/api/outreach?${params}`);
    if (res.ok) {
      const json = await res.json();
      setOutreach(json.data || []);
      setTotal(json.total || 0);
    }
  }, [filter]);

  useEffect(() => {
    Promise.all([fetchCampaigns(), fetchOutreach()]).finally(() => setLoading(false));
  }, [fetchCampaigns, fetchOutreach]);

  // Aggregate stats from campaigns
  const totals = campaigns.reduce(
    (acc, c) => ({
      clubs: acc.clubs + c.total_clubs,
      contacted: acc.contacted + c.contacted,
      opened: acc.opened + c.opened,
      replied: acc.replied + c.replied,
      demos: acc.demos + c.demos_scheduled + c.demos_completed,
      onboarded: acc.onboarded + c.onboarded,
    }),
    { clubs: 0, contacted: 0, opened: 0, replied: 0, demos: 0, onboarded: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2E12]">Outreach CRM</h1>
          <p className="text-sm text-[#3D5A3E]">Club acquisition and email campaigns</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#0A2E12]/10">
        {(["dashboard", "clubs", "campaigns"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "text-[#0A2E12] border-b-2 border-emerald-600"
                : "text-[#3D5A3E] hover:text-[#0A2E12]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {tab === "dashboard" && (
        <>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Total Clubs" value={totals.clubs} />
            <StatCard label="Contacted" value={totals.contacted} sub={totals.clubs ? `${Math.round((totals.contacted / totals.clubs) * 100)}%` : ""} />
            <StatCard label="Opened" value={totals.opened} />
            <StatCard label="Replied" value={totals.replied} />
            <StatCard label="Demos" value={totals.demos} />
            <StatCard label="Onboarded" value={totals.onboarded} sub={totals.contacted ? `${Math.round((totals.onboarded / totals.contacted) * 100)}% conversion` : ""} />
          </div>

          {/* Pipeline funnel */}
          <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#0A2E12] mb-4">Acquisition Pipeline</h2>
            {totals.clubs === 0 ? (
              <p className="text-[#3D5A3E] text-sm">
                No outreach data yet. Create a campaign and add clubs to start tracking.
              </p>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Not Contacted", value: totals.clubs - totals.contacted, color: "bg-zinc-300" },
                  { label: "Contacted", value: totals.contacted, color: "bg-blue-400" },
                  { label: "Opened", value: totals.opened, color: "bg-cyan-400" },
                  { label: "Replied", value: totals.replied, color: "bg-emerald-400" },
                  { label: "Demo", value: totals.demos, color: "bg-amber-400" },
                  { label: "Onboarded", value: totals.onboarded, color: "bg-green-500" },
                ].map((stage) => (
                  <div key={stage.label} className="flex items-center gap-3">
                    <span className="text-sm text-[#3D5A3E] w-28 shrink-0">{stage.label}</span>
                    <div className="flex-1 bg-zinc-100 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                        style={{ width: `${totals.clubs ? (stage.value / totals.clubs) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-[#0A2E12] w-12 text-right">{stage.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Clubs Tab */}
      {tab === "clubs" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-[#0A2E12]/20 px-3 py-2 text-sm bg-white text-[#0A2E12]"
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <span className="text-sm text-[#3D5A3E]">{total} clubs</span>
          </div>

          {outreach.length === 0 ? (
            <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-12 text-center">
              <p className="text-[#3D5A3E]">No outreach records yet.</p>
              <p className="text-sm text-[#3D5A3E]/60 mt-1">
                Import clubs or create a campaign to start tracking outreach.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#0A2E12]/10 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#f0fdf4] text-[#3D5A3E]">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Club</th>
                    <th className="text-left px-4 py-3 font-medium">Country</th>
                    <th className="text-left px-4 py-3 font-medium">Contact</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Last Contact</th>
                    <th className="text-left px-4 py-3 font-medium">Step</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0A2E12]/5">
                  {outreach.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#f0fdf4]/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#0A2E12]">
                        {rec.clubs?.name || "Unknown"}
                        {rec.clubs?.city && (
                          <span className="text-[#3D5A3E]/60 text-xs ml-1">({rec.clubs.city})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#3D5A3E]">{rec.clubs?.country_code || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="text-[#0A2E12]">{rec.contact_name || "—"}</div>
                        <div className="text-xs text-[#3D5A3E]/60">{rec.contact_email || ""}</div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                      <td className="px-4 py-3 text-[#3D5A3E] text-xs">
                        {rec.last_contacted_at
                          ? new Date(rec.last_contacted_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-[#3D5A3E]">{rec.current_sequence_step || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {tab === "campaigns" && (
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-12 text-center">
              <p className="text-[#3D5A3E]">No campaigns yet.</p>
              <p className="text-sm text-[#3D5A3E]/60 mt-1">
                Create your first outreach campaign to start contacting clubs.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {campaigns.map((c) => (
                <div key={c.campaign_id} className="rounded-xl border border-[#0A2E12]/10 bg-white p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#0A2E12]">{c.name}</h3>
                      {c.country_code && (
                        <span className="text-xs text-[#3D5A3E]/60">{c.country_code}</span>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : c.status === "paused"
                          ? "bg-amber-100 text-amber-700"
                          : c.status === "completed"
                          ? "bg-zinc-100 text-zinc-600"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-[#0A2E12]">{c.total_clubs}</p>
                      <p className="text-xs text-[#3D5A3E]">Clubs</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{c.contacted}</p>
                      <p className="text-xs text-[#3D5A3E]">Contacted</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-600">{c.replied}</p>
                      <p className="text-xs text-[#3D5A3E]">Replied</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{c.onboarded}</p>
                      <p className="text-xs text-[#3D5A3E]">Onboarded</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
