"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ReportResultModal } from "@/components/stats/ReportResultModal";

interface MatchRow {
  id: string;
  sport: string;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  courts: { name: string } | null;
  match_players: {
    player_id: string;
    team: number | null;
    players: { display_name: string; avatar_url: string | null } | null;
  }[];
}

export default function MatchesAdminPage() {
  const [sportFilter, setSportFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportMatchId, setReportMatchId] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("matches")
      .select(
        "*, courts(name), match_players(player_id, team, players(display_name, avatar_url))",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (sportFilter) query = query.eq("sport", sportFilter);
    if (statusFilter) query = query.eq("status", statusFilter);

    const { data, count } = await query;
    setMatches((data as MatchRow[] | null) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, [sportFilter, statusFilter]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">
        Match History ({total})
      </h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800"
        >
          <option value="">All Sports</option>
          <option value="pickleball">Pickleball</option>
          <option value="lawn_bowling">Lawn Bowling</option>
          <option value="tennis">Tennis</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-800"
        >
          <option value="">All Statuses</option>
          <option value="queued">Queued</option>
          <option value="playing">Playing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-zinc-500">Loading matches...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500">
                <th className="pb-2 font-medium">Sport</th>
                <th className="pb-2 font-medium">Players</th>
                <th className="pb-2 font-medium">Court</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Duration</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {matches.map((match) => {
                const duration =
                  match.started_at && match.ended_at
                    ? Math.round(
                        (new Date(match.ended_at).getTime() -
                          new Date(match.started_at).getTime()) /
                          60000
                      )
                    : null;

                return (
                  <tr key={match.id}>
                    <td className="py-3 text-zinc-800 capitalize">
                      {match.sport.replace("_", " ")}
                    </td>
                    <td className="py-3 text-zinc-500">
                      {match.match_players
                        ?.map((mp) => mp.players?.display_name)
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </td>
                    <td className="py-3 text-zinc-500">
                      {match.courts?.name ?? "-"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          match.status === "completed"
                            ? "bg-zinc-100 text-zinc-500"
                            : match.status === "playing"
                              ? "bg-red-50 text-red-600"
                              : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {match.status}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-500">
                      {duration !== null ? `${duration} min` : "-"}
                    </td>
                    <td className="py-3 text-zinc-500">
                      {new Date(match.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      {match.status === "completed" && (
                        <button
                          onClick={() => setReportMatchId(match.id)}
                          className="rounded-lg bg-[#1B5E20]/5 px-3 py-1 text-xs font-medium text-[#1B5E20] hover:bg-[#1B5E20]/10 transition-colors"
                        >
                          Report Score
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {matches.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500 italic">
              No matches found.
            </p>
          )}
        </div>
      )}

      {reportMatchId && (
        <ReportResultModal
          open={!!reportMatchId}
          onOpenChange={(open) => { if (!open) setReportMatchId(null); }}
          matchId={reportMatchId}
          onReported={() => {
            setReportMatchId(null);
            fetchMatches();
          }}
        />
      )}
    </div>
  );
}
