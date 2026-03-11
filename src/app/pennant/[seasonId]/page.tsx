"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { DivisionLadder } from "@/components/pennant/DivisionLadder";
import { FixtureCard } from "@/components/pennant/FixtureCard";
import { calculateDivisionStandings } from "@/lib/pennant-engine";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  PennantSeason,
  PennantDivision,
  PennantTeam,
  PennantFixture,
  PennantFixtureResult,
} from "@/lib/types";

export default function PennantSeasonPage() {
  const params = useParams();
  const seasonId = params?.seasonId as string;

  const [season, setSeason] = useState<PennantSeason | null>(null);
  const [divisions, setDivisions] = useState<PennantDivision[]>([]);
  const [teams, setTeams] = useState<PennantTeam[]>([]);
  const [fixtures, setFixtures] = useState<PennantFixture[]>([]);
  const [results, setResults] = useState<PennantFixtureResult[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserTeamId, setCurrentUserTeamId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const [seasonRes, divisionsRes, teamsRes, fixturesRes, resultsRes] = await Promise.all([
      supabase.from("pennant_seasons").select("*").eq("id", seasonId).single(),
      supabase.from("pennant_divisions").select("*").eq("season_id", seasonId).order("grade"),
      supabase.from("pennant_teams").select("*").eq("season_id", seasonId),
      supabase
        .from("pennant_fixtures")
        .select("*, home_team:pennant_teams!home_team_id(*), away_team:pennant_teams!away_team_id(*)")
        .eq("season_id", seasonId)
        .order("round"),
      supabase.from("pennant_fixture_results").select("*"),
    ]);

    if (seasonRes.data) setSeason(seasonRes.data as PennantSeason);
    const divs = (divisionsRes.data as PennantDivision[]) ?? [];
    setDivisions(divs);
    if (divs.length > 0 && !selectedDivision) {
      setSelectedDivision(divs[0].id);
    }
    setTeams((teamsRes.data as PennantTeam[]) ?? []);
    setFixtures((fixturesRes.data as PennantFixture[]) ?? []);
    setResults((resultsRes.data as PennantFixtureResult[]) ?? []);

    // Get current user's team
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: player } = await supabase.from("players").select("id").eq("user_id", user.id).single();
      if (player) {
        const { data: membership } = await supabase
          .from("pennant_team_members")
          .select("team_id")
          .eq("player_id", player.id)
          .limit(1)
          .single();
        if (membership) setCurrentUserTeamId(membership.team_id);
      }
    }

    setLoading(false);
  }, [seasonId, selectedDivision]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  const divisionTeams = teams.filter((t) => t.division_id === selectedDivision);
  const divisionFixtures = fixtures.filter((f) => f.division_id === selectedDivision);
  const divisionResults = results.filter((r) =>
    divisionFixtures.some((f) => f.id === r.fixture_id)
  );

  const standings = calculateDivisionStandings(divisionTeams, divisionFixtures, divisionResults);

  const upcomingFixtures = divisionFixtures
    .filter((f) => f.status === "scheduled" || f.status === "in_progress")
    .slice(0, 6);
  const completedFixtures = divisionFixtures
    .filter((f) => f.status === "completed")
    .reverse()
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link href="/pennant" className="text-sm text-zinc-400 hover:text-zinc-600 mb-1 block">
            &larr; Seasons
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">
            {season?.name ?? "Season"}
          </h1>
          <p className="text-sm text-zinc-500">
            {season?.season_year} &middot; {season?.rounds_total} rounds
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Division tabs */}
        {divisions.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {divisions.map((div) => (
              <button
                key={div.id}
                onClick={() => setSelectedDivision(div.id)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-colors min-h-[40px] touch-manipulation",
                  selectedDivision === div.id
                    ? "bg-[#1B5E20] text-white"
                    : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400"
                )}
              >
                {div.name}
              </button>
            ))}
          </div>
        )}

        {/* Standings */}
        <DivisionLadder
          standings={standings}
          userTeamId={currentUserTeamId ?? undefined}
          divisionName={divisions.find((d) => d.id === selectedDivision)?.name}
        />

        {/* Upcoming Fixtures */}
        {upcomingFixtures.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
              Upcoming Fixtures
            </h2>
            <div className="space-y-2">
              {upcomingFixtures.map((fixture) => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  seasonId={seasonId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Results */}
        {completedFixtures.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
              Recent Results
            </h2>
            <div className="space-y-2">
              {completedFixtures.map((fixture) => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  seasonId={seasonId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Link to full division detail */}
        {selectedDivision && (
          <Link
            href={`/pennant/${seasonId}/${selectedDivision}`}
            className="block text-center text-sm font-semibold text-[#1B5E20] hover:underline"
          >
            View Full Division Details
          </Link>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
