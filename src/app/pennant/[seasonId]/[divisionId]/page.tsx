"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { DivisionLadder } from "@/components/pennant/DivisionLadder";
import { FixtureCard } from "@/components/pennant/FixtureCard";
import { calculateDivisionStandings } from "@/lib/pennant-engine";
import Link from "next/link";
import type {
  PennantSeason,
  PennantDivision,
  PennantTeam,
  PennantFixture,
  PennantFixtureResult,
} from "@/lib/types";

export default function PennantDivisionPage() {
  const params = useParams();
  const seasonId = params?.seasonId as string;
  const divisionId = params?.divisionId as string;

  const [season, setSeason] = useState<PennantSeason | null>(null);
  const [division, setDivision] = useState<PennantDivision | null>(null);
  const [teams, setTeams] = useState<PennantTeam[]>([]);
  const [fixtures, setFixtures] = useState<PennantFixture[]>([]);
  const [results, setResults] = useState<PennantFixtureResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserTeamId, setCurrentUserTeamId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const [seasonRes, divRes, teamsRes, fixturesRes, resultsRes] = await Promise.all([
      supabase.from("pennant_seasons").select("*").eq("id", seasonId).single(),
      supabase.from("pennant_divisions").select("*").eq("id", divisionId).single(),
      supabase.from("pennant_teams").select("*").eq("division_id", divisionId),
      supabase
        .from("pennant_fixtures")
        .select("*, home_team:pennant_teams!home_team_id(*), away_team:pennant_teams!away_team_id(*)")
        .eq("division_id", divisionId)
        .order("round"),
      supabase.from("pennant_fixture_results").select("*"),
    ]);

    if (seasonRes.data) setSeason(seasonRes.data as PennantSeason);
    if (divRes.data) setDivision(divRes.data as PennantDivision);
    setTeams((teamsRes.data as PennantTeam[]) ?? []);
    setFixtures((fixturesRes.data as PennantFixture[]) ?? []);
    setResults((resultsRes.data as PennantFixtureResult[]) ?? []);

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
  }, [seasonId, divisionId]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  const divFixtures = fixtures.filter((f) => f.division_id === divisionId);
  const divResults = results.filter((r) => divFixtures.some((f) => f.id === r.fixture_id));
  const standings = calculateDivisionStandings(teams, divFixtures, divResults);

  // Group fixtures by round
  const rounds = new Map<number, PennantFixture[]>();
  for (const f of divFixtures) {
    const existing = rounds.get(f.round) ?? [];
    existing.push(f);
    rounds.set(f.round, existing);
  }
  const sortedRounds = Array.from(rounds.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link href={`/pennant/${seasonId}`} className="text-sm text-zinc-400 hover:text-zinc-600 mb-1 block">
            &larr; {season?.name ?? "Season"}
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">
            {division?.name ?? "Division"}
          </h1>
          <p className="text-sm text-zinc-500">
            {season?.name} &middot; {teams.length} teams
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <DivisionLadder
          standings={standings}
          userTeamId={currentUserTeamId ?? undefined}
        />

        {sortedRounds.map(([round, roundFixtures]) => (
          <div key={round}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
              Round {round}
            </h2>
            <div className="space-y-2">
              {roundFixtures.map((fixture) => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  seasonId={seasonId}
                />
              ))}
            </div>
          </div>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
