"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SPORT_LABELS } from "@/lib/types";
import { SportIcon } from "@/components/icons/SportIcon";
import { getSportColor } from "@/lib/design";
import type { Sport } from "@/lib/types";
import { BottomNav } from "@/components/board/BottomNav";

export default function JoinTeamPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [team, setTeam] = useState<{
    id: string;
    name: string;
    sport: string;
    description: string | null;
    captain: { name: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch(`/api/teams/join/${code}`);
        if (res.ok) {
          const data = await res.json();
          setTeam(data.team);
        } else {
          setError("Invalid invite code");
        }
      } catch {
        setError("Failed to load team");
      }
      setLoading(false);
    }
    fetchTeam();
  }, [code]);

  async function handleJoin() {
    setJoining(true);
    setError("");
    try {
      const res = await fetch(`/api/teams/join/${code}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join");
      }
      const data = await res.json();
      router.push(`/teams/${data.team.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  const sportLabel = team ? SPORT_LABELS[team.sport as keyof typeof SPORT_LABELS] : null;
  const sportColor = team ? getSportColor(team.sport) : null;

  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/teams" className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold text-zinc-900">Join Team</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-md px-4 py-8">
        {team ? (
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{ backgroundColor: sportColor ? `${sportColor.primary}15` : undefined }}
            >
              <SportIcon sport={team.sport as Sport} className="w-8 h-8" />
            </div>
            <h2 className="mb-1 text-xl font-bold text-zinc-900">{team.name}</h2>
            {team.description && (
              <p className="mb-3 text-sm text-zinc-400">{team.description}</p>
            )}
            <p className="mb-6 text-sm text-zinc-500">
              {sportLabel?.label ?? team.sport} &middot; Captain: {team.captain?.name}
            </p>

            <button
              onClick={handleJoin}
              disabled={joining}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] py-3 font-semibold text-white transition-colors hover:bg-[#1B5E20] disabled:opacity-50"
            >
              <Users className="h-4 w-4" />
              {joining ? "Joining..." : "Join This Team"}
            </button>

            {error && (
              <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 text-center">
            <p className="text-zinc-500">{error || "Team not found"}</p>
            <Link href="/teams" className="mt-4 inline-block text-sm text-[#1B5E20] hover:underline">
              Back to Teams
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
