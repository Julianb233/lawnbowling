"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { generateRoundRobinFixtures } from "@/lib/pennant-engine";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type {
  PennantSeasonFormat,
  PennantTeam,
} from "@/lib/types";

interface DivisionDraft {
  name: string;
  grade: number;
  teams: { name: string; clubId: string }[];
}

export default function PennantAdminPage() {
  const router = useRouter();

  // Season form
  const [name, setName] = useState("");
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear());
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [roundsTotal, setRoundsTotal] = useState(7);
  const [format, setFormat] = useState<PennantSeasonFormat>("round_robin");
  const [description, setDescription] = useState("");

  // Divisions
  const [divisions, setDivisions] = useState<DivisionDraft[]>([
    { name: "Division 1", grade: 1, teams: [] },
  ]);

  // New team input per division
  const [newTeamName, setNewTeamName] = useState<Record<number, string>>({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addDivision() {
    setDivisions((prev) => [
      ...prev,
      { name: `Division ${prev.length + 1}`, grade: prev.length + 1, teams: [] },
    ]);
  }

  function removeDivision(idx: number) {
    setDivisions((prev) => prev.filter((_, i) => i !== idx));
  }

  function addTeam(divIdx: number) {
    const teamName = newTeamName[divIdx]?.trim();
    if (!teamName) return;
    setDivisions((prev) =>
      prev.map((d, i) =>
        i === divIdx ? { ...d, teams: [...d.teams, { name: teamName, clubId: "" }] } : d
      )
    );
    setNewTeamName((prev) => ({ ...prev, [divIdx]: "" }));
  }

  function removeTeam(divIdx: number, teamIdx: number) {
    setDivisions((prev) =>
      prev.map((d, i) =>
        i === divIdx ? { ...d, teams: d.teams.filter((_, ti) => ti !== teamIdx) } : d
      )
    );
  }

  async function handleCreate() {
    if (!name || !startsAt || !endsAt) {
      setError("Please fill in season name, start and end dates.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setSaving(false); return; }

      const { data: player } = await supabase.from("players").select("id").eq("user_id", user.id).single();

      // Create season
      const { data: season, error: seasonErr } = await supabase
        .from("pennant_seasons")
        .insert({
          name,
          season_year: seasonYear,
          starts_at: startsAt,
          ends_at: endsAt,
          rounds_total: roundsTotal,
          format,
          description: description || null,
          created_by: player?.id ?? user.id,
          venue_id: "00000000-0000-0000-0000-000000000000", // placeholder
          sport: "lawn_bowling",
        })
        .select("id")
        .single();

      if (seasonErr || !season) {
        setError(seasonErr?.message ?? "Failed to create season");
        setSaving(false);
        return;
      }

      // Create divisions, teams, and fixtures
      for (const div of divisions) {
        const { data: division } = await supabase
          .from("pennant_divisions")
          .insert({
            season_id: season.id,
            name: div.name,
            grade: div.grade,
          })
          .select("id")
          .single();

        if (!division) continue;

        // Create teams
        const createdTeams: PennantTeam[] = [];
        for (const team of div.teams) {
          const { data: t } = await supabase
            .from("pennant_teams")
            .insert({
              season_id: season.id,
              division_id: division.id,
              name: team.name,
              club_id: team.clubId || null,
            })
            .select("*")
            .single();
          if (t) createdTeams.push(t as PennantTeam);
        }

        // Generate fixtures
        if (createdTeams.length >= 2) {
          const fixtureData = generateRoundRobinFixtures(
            createdTeams,
            roundsTotal,
            season.id,
            division.id
          );

          if (fixtureData.length > 0) {
            await supabase.from("pennant_fixtures").insert(fixtureData);
          }
        }
      }

      router.push(`/pennant/${season.id}`);
    } catch (e) {
      setError("An error occurred while creating the season.");
    }

    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-[#0A2E12]/[0.03] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link href="/pennant" className="text-sm text-[#3D5A3E] hover:text-[#3D5A3E] mb-1 block">
            &larr; Seasons
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-[#0A2E12]">
            Create Pennant Season
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Season Details */}
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#2D4A30]">Season Details</h2>

          <div>
            <label className="block text-xs font-semibold text-[#3D5A3E] mb-1">Season Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2026 Winter Pennant"
              className="w-full rounded-lg border border-[#0A2E12]/10 px-3 py-2.5 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D5A3E] mb-1">Year</label>
              <input
                type="number"
                value={seasonYear}
                onChange={(e) => setSeasonYear(Number(e.target.value))}
                className="w-full rounded-lg border border-[#0A2E12]/10 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D5A3E] mb-1">Rounds</label>
              <input
                type="number"
                value={roundsTotal}
                onChange={(e) => setRoundsTotal(Number(e.target.value))}
                min={1}
                className="w-full rounded-lg border border-[#0A2E12]/10 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D5A3E] mb-1">Start Date</label>
              <input
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-lg border border-[#0A2E12]/10 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D5A3E] mb-1">End Date</label>
              <input
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full rounded-lg border border-[#0A2E12]/10 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D5A3E] mb-1">Format</label>
            <div className="flex gap-2">
              {(["round_robin", "home_away"] as PennantSeasonFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                    format === f
                      ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                      : "border-[#0A2E12]/10 bg-white text-[#3D5A3E] hover:border-[#0A2E12]/10"
                  )}
                >
                  {f === "round_robin" ? "Round Robin" : "Home & Away"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D5A3E] mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-[#0A2E12]/10 px-3 py-2.5 text-sm resize-none focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
            />
          </div>
        </div>

        {/* Divisions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#2D4A30]">Divisions & Teams</h2>
            <button
              type="button"
              onClick={addDivision}
              className="rounded-lg border border-[#0A2E12]/10 px-3 py-1.5 text-xs font-semibold text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03] min-h-[32px] touch-manipulation"
            >
              + Add Division
            </button>
          </div>

          {divisions.map((div, divIdx) => (
            <div key={divIdx} className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={div.name}
                  onChange={(e) =>
                    setDivisions((prev) =>
                      prev.map((d, i) => (i === divIdx ? { ...d, name: e.target.value } : d))
                    )
                  }
                  className="text-sm font-bold text-[#2D4A30] border-none p-0 focus:outline-none bg-transparent"
                />
                {divisions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDivision(divIdx)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>

              {div.teams.map((team, teamIdx) => (
                <div key={teamIdx} className="flex items-center gap-2 pl-2">
                  <span className="text-sm text-[#3D5A3E]">{team.name}</span>
                  <button
                    type="button"
                    onClick={() => removeTeam(divIdx, teamIdx)}
                    className="text-[10px] text-[#3D5A3E] hover:text-red-500"
                  >
                    remove
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTeamName[divIdx] ?? ""}
                  onChange={(e) => setNewTeamName((prev) => ({ ...prev, [divIdx]: e.target.value }))}
                  placeholder="Team name..."
                  className="flex-1 rounded-lg border border-[#0A2E12]/10 px-3 py-2 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addTeam(divIdx); }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addTeam(divIdx)}
                  className="rounded-lg bg-[#0A2E12]/5 px-3 py-2 text-xs font-semibold text-[#3D5A3E] hover:bg-[#0A2E12]/5 min-h-[36px] touch-manipulation"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {/* Create button */}
        <button
          onClick={handleCreate}
          disabled={saving}
          className="w-full rounded-xl bg-[#1B5E20] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#145218] disabled:opacity-40 min-h-[48px] touch-manipulation"
        >
          {saving ? "Creating Season..." : "Create Season & Generate Fixtures"}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
