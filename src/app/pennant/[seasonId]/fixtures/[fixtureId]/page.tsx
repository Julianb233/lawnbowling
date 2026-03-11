"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  PennantFixture,
  PennantFixtureResult,
  PennantTeam,
  PennantTeamMember,
  Player,
} from "@/lib/types";

export default function FixtureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seasonId = params?.seasonId as string;
  const fixtureId = params?.fixtureId as string;

  const [fixture, setFixture] = useState<PennantFixture | null>(null);
  const [result, setResult] = useState<PennantFixtureResult | null>(null);
  const [homeMembers, setHomeMembers] = useState<(PennantTeamMember & { player?: Player })[]>([]);
  const [awayMembers, setAwayMembers] = useState<(PennantTeamMember & { player?: Player })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showResultForm, setShowResultForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Result form state
  const [homeShotTotal, setHomeShotTotal] = useState(0);
  const [awayShotTotal, setAwayShotTotal] = useState(0);
  const [homeRinkWins, setHomeRinkWins] = useState(0);
  const [awayRinkWins, setAwayRinkWins] = useState(0);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const { data: fixtureData } = await supabase
      .from("pennant_fixtures")
      .select("*, home_team:pennant_teams!home_team_id(*), away_team:pennant_teams!away_team_id(*)")
      .eq("id", fixtureId)
      .single();

    if (fixtureData) {
      setFixture(fixtureData as PennantFixture);

      // Load team members
      const [homeRes, awayRes] = await Promise.all([
        supabase
          .from("pennant_team_members")
          .select("*, player:players(*)")
          .eq("team_id", fixtureData.home_team_id),
        supabase
          .from("pennant_team_members")
          .select("*, player:players(*)")
          .eq("team_id", fixtureData.away_team_id),
      ]);
      setHomeMembers((homeRes.data ?? []) as (PennantTeamMember & { player?: Player })[]);
      setAwayMembers((awayRes.data ?? []) as (PennantTeamMember & { player?: Player })[]);
    }

    // Load result
    const { data: resultData } = await supabase
      .from("pennant_fixture_results")
      .select("*")
      .eq("fixture_id", fixtureId)
      .single();

    if (resultData) {
      const r = resultData as PennantFixtureResult;
      setResult(r);
      setHomeShotTotal(r.home_shot_total);
      setAwayShotTotal(r.away_shot_total);
      setHomeRinkWins(r.home_rink_wins);
      setAwayRinkWins(r.away_rink_wins);
    }

    // Check admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: player } = await supabase.from("players").select("id, role").eq("user_id", user.id).single();
      if (player?.role === "admin") setIsAdmin(true);
    }

    setLoading(false);
  }, [fixtureId]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleSaveResult() {
    if (!fixture) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { data: player } = await supabase.from("players").select("id").eq("user_id", user.id).single();

    const winnerTeamId =
      homeShotTotal > awayShotTotal
        ? fixture.home_team_id
        : awayShotTotal > homeShotTotal
          ? fixture.away_team_id
          : null;

    const pointsHome = winnerTeamId === fixture.home_team_id ? 2 : winnerTeamId === null ? 1 : 0;
    const pointsAway = winnerTeamId === fixture.away_team_id ? 2 : winnerTeamId === null ? 1 : 0;

    const resultData = {
      fixture_id: fixtureId,
      home_rink_wins: homeRinkWins,
      away_rink_wins: awayRinkWins,
      home_shot_total: homeShotTotal,
      away_shot_total: awayShotTotal,
      winner_team_id: winnerTeamId,
      points_home: pointsHome,
      points_away: pointsAway,
      recorded_by: player?.id ?? user.id,
    };

    if (result) {
      await supabase.from("pennant_fixture_results").update(resultData).eq("id", result.id);
    } else {
      await supabase.from("pennant_fixture_results").insert(resultData);
    }

    // Mark fixture completed
    await supabase.from("pennant_fixtures").update({ status: "completed" }).eq("id", fixtureId);

    setSaving(false);
    setShowResultForm(false);
    loadData();
  }

  async function handleGenerateDraw() {
    if (!fixture) return;
    const supabase = createClient();

    // Create a tournament linked to this fixture
    const { data: tournament } = await supabase
      .from("tournaments")
      .insert({
        name: `${fixture.home_team?.name ?? "Home"} vs ${fixture.away_team?.name ?? "Away"} — Round ${fixture.round}`,
        sport: "lawn_bowling",
        format: "fours",
        status: "active",
      })
      .select("id")
      .single();

    if (tournament) {
      // Link tournament to fixture
      await supabase
        .from("pennant_fixtures")
        .update({ tournament_id: tournament.id })
        .eq("id", fixtureId);

      router.push(`/bowls/${tournament.id}`);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-zinc-400">Fixture not found</p>
      </div>
    );
  }

  const homeName = fixture.home_team?.name ?? "Home";
  const awayName = fixture.away_team?.name ?? "Away";

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link href={`/pennant/${seasonId}`} className="text-sm text-zinc-400 hover:text-zinc-600 mb-1 block">
            &larr; Season
          </Link>
          <h1 className="text-xl font-black tracking-tight text-zinc-900">
            Round {fixture.round}
          </h1>
          <p className="text-sm text-zinc-500">
            {homeName} vs {awayName}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Match card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 text-right">
              <p className="text-lg font-bold text-zinc-900">{homeName}</p>
              <p className="text-xs uppercase tracking-wider text-zinc-400">Home</p>
            </div>

            <div className="shrink-0 text-center px-4">
              {result ? (
                <div className="flex items-center gap-2">
                  <span className={cn("text-3xl font-black", result.winner_team_id === fixture.home_team_id ? "text-[#1B5E20]" : "text-zinc-400")}>
                    {result.home_shot_total}
                  </span>
                  <span className="text-zinc-300">-</span>
                  <span className={cn("text-3xl font-black", result.winner_team_id === fixture.away_team_id ? "text-[#1B5E20]" : "text-zinc-400")}>
                    {result.away_shot_total}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-zinc-300">VS</span>
              )}
            </div>

            <div className="flex-1">
              <p className="text-lg font-bold text-zinc-900">{awayName}</p>
              <p className="text-xs uppercase tracking-wider text-zinc-400">Away</p>
            </div>
          </div>

          {result && (
            <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-center gap-6 text-xs text-zinc-500">
              <span>Rink wins: {result.home_rink_wins} - {result.away_rink_wins}</span>
              <span>Points: {result.points_home} - {result.points_away}</span>
            </div>
          )}

          {fixture.venue && (
            <p className="mt-3 text-center text-xs text-zinc-400">{fixture.venue}</p>
          )}
          {fixture.scheduled_at && (
            <p className="mt-1 text-center text-xs text-zinc-400">
              {new Date(fixture.scheduled_at).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              at{" "}
              {new Date(fixture.scheduled_at).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            {!fixture.tournament_id && (
              <button
                onClick={handleGenerateDraw}
                className="rounded-xl bg-[#1B5E20] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#145218] transition-colors min-h-[44px] touch-manipulation"
              >
                Generate Draw for This Fixture
              </button>
            )}
            {fixture.tournament_id && (
              <Link
                href={`/bowls/${fixture.tournament_id}`}
                className="rounded-xl border border-[#1B5E20]/30 bg-[#1B5E20]/5 px-4 py-2.5 text-sm font-semibold text-[#1B5E20] hover:bg-[#1B5E20]/10 min-h-[44px] touch-manipulation inline-flex items-center"
              >
                View Draw
              </Link>
            )}
            <button
              onClick={() => setShowResultForm(!showResultForm)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors min-h-[44px] touch-manipulation"
            >
              {result ? "Edit Result" : "Enter Result"}
            </button>
          </div>
        )}

        {/* Result entry form */}
        {showResultForm && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-700">Match Result</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">{homeName} Shot Total</label>
                <input
                  type="number"
                  value={homeShotTotal}
                  onChange={(e) => setHomeShotTotal(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">{awayName} Shot Total</label>
                <input
                  type="number"
                  value={awayShotTotal}
                  onChange={(e) => setAwayShotTotal(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">{homeName} Rink Wins</label>
                <input
                  type="number"
                  value={homeRinkWins}
                  onChange={(e) => setHomeRinkWins(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">{awayName} Rink Wins</label>
                <input
                  type="number"
                  value={awayRinkWins}
                  onChange={(e) => setAwayRinkWins(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  min={0}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveResult}
                disabled={saving}
                className="rounded-xl bg-[#1B5E20] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#145218] disabled:opacity-40 min-h-[44px] touch-manipulation"
              >
                {saving ? "Saving..." : "Save Result"}
              </button>
              <button
                onClick={() => setShowResultForm(false)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 min-h-[44px] touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Team rosters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-600">
              {homeName}
            </h3>
            {homeMembers.length === 0 ? (
              <p className="text-xs text-zinc-400">No players assigned</p>
            ) : (
              <div className="space-y-2">
                {homeMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className="text-sm text-zinc-700">{m.player?.display_name ?? "Unknown"}</span>
                    {m.role === "captain" && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                        Captain
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600">
              {awayName}
            </h3>
            {awayMembers.length === 0 ? (
              <p className="text-xs text-zinc-400">No players assigned</p>
            ) : (
              <div className="space-y-2">
                {awayMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className="text-sm text-zinc-700">{m.player?.display_name ?? "Unknown"}</span>
                    {m.role === "captain" && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                        Captain
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
