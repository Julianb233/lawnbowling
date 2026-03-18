"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PennantSeason, PennantSeasonStatus } from "@/lib/types";

const STATUS_LABELS: Record<PennantSeasonStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-[#0A2E12]/5 text-[#3D5A3E]" },
  registration: { label: "Registration Open", color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In Progress", color: "bg-green-100 text-green-700" },
  completed: { label: "Completed", color: "bg-purple-100 text-purple-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-500" },
};

const STATUS_ORDER: PennantSeasonStatus[] = ["in_progress", "registration", "draft", "completed", "cancelled"];

export default function PennantSeasonsPage() {
  const [seasons, setSeasons] = useState<PennantSeason[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeasons() {
      const supabase = createClient();
      const { data } = await supabase
        .from("pennant_seasons")
        .select("*")
        .order("starts_at", { ascending: false });
      setSeasons((data as PennantSeason[]) ?? []);
      setLoading(false);
    }
    loadSeasons();
  }, []);

  // Group by status
  const grouped = STATUS_ORDER.map((status) => ({
    status,
    ...STATUS_LABELS[status],
    seasons: seasons.filter((s) => s.status === status),
  })).filter((g) => g.seasons.length > 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A2E12]/[0.03] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>Pennant Seasons</h1>
              <p className="text-sm text-[#3D5A3E]">League competitions and standings</p>
            </div>
            <Link
              href="/pennant/admin"
              className="rounded-xl bg-[#1B5E20] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#145218] transition-colors min-h-[44px] touch-manipulation"
            >
              New Season
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-8">
        {grouped.length === 0 && (
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-[#3D5A3E]">No pennant seasons yet</p>
            <p className="mt-1 text-sm text-[#3D5A3E]">
              Create your first season to get started with league play.
            </p>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.status}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#3D5A3E]" style={{ fontFamily: "var(--font-display)" }}>
              {group.label}
            </h2>
            <div className="space-y-3">
              {group.seasons.map((season) => (
                <Link
                  key={season.id}
                  href={`/pennant/${season.id}`}
                  className="block rounded-2xl border border-[#0A2E12]/10 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#0A2E12]">{season.name}</h3>
                      <p className="mt-1 text-sm text-[#3D5A3E]">
                        {season.season_year} &middot; {season.rounds_total} rounds &middot;{" "}
                        {season.format === "round_robin" ? "Round Robin" : "Home & Away"}
                      </p>
                      {season.description && (
                        <p className="mt-1 text-xs text-[#3D5A3E] line-clamp-2">{season.description}</p>
                      )}
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold", group.color)}>
                      {group.label}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-[#3D5A3E]">
                    {new Date(season.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" — "}
                    {new Date(season.ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
