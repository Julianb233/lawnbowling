"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Play, Users } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/board/BottomNav";
import { TournamentBracket } from "@/components/tournament/TournamentBracket";
import { TournamentStandings } from "@/components/tournament/TournamentStandings";
import { BracketView } from "@/components/tournament/BracketView";
import { RoundRobinView } from "@/components/tournament/RoundRobinView";
import { JoinTournamentButton } from "@/components/tournament/JoinTournamentButton";
import { SPORT_LABELS, TOURNAMENT_FORMAT_LABELS } from "@/lib/types";
import { SportIcon } from "@/components/icons/SportIcon";
import type { Sport } from "@/lib/types";
import type { TournamentFormat, TournamentStatus } from "@/lib/types";
import { getSportColor } from "@/lib/design";
import { cn } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";

interface TournamentDetail {
  id: string;
  name: string;
  sport: string;
  format: TournamentFormat;
  status: TournamentStatus;
  max_players: number;
  starts_at: string | null;
  created_by: string;
  creator?: { id: string; display_name: string; avatar_url: string | null };
}

export default function TournamentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [matches, setMatches] = useState<Array<Record<string, unknown>>>([]);
  const [standings, setStandings] = useState<Array<Record<string, unknown>>>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportingMatch, setReportingMatch] = useState<string | null>(null);
  const [score, setScore] = useState("");
  const [winnerId, setWinnerId] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/tournament/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTournament(data.tournament);
        setMatches(data.matches ?? []);
        setStandings(data.standings ?? []);
        setCurrentPlayerId(data.currentPlayerId ?? null);
        setIsJoined(data.isJoined ?? false);
        setParticipantCount(data.participantCount ?? 0);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleReportResult(e: React.FormEvent) {
    e.preventDefault();
    if (!reportingMatch || !winnerId) return;

    try {
      const res = await fetch(`/api/tournament/${id}/match/${reportingMatch}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winner_id: winnerId, score }),
      });
      if (res.ok) {
        setReportingMatch(null);
        setScore("");
        setWinnerId("");
        fetchData();
      }
    } catch {
      // ignore
    }
  }

  async function handleStartTournament() {
    try {
      const res = await fetch(`/api/tournament/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEFCF9]">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="h-48 animate-pulse rounded-2xl bg-[#0A2E12]/5" />
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#FEFCF9]">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-[#3D5A3E]">Tournament not found</p>
          <Link href="/tournament" className="mt-4 inline-block text-sm text-[#1B5E20] hover:underline">
            Back to tournaments
          </Link>
        </div>
      </div>
    );
  }

  const sportColor = getSportColor(tournament.sport);
  const sportLabel = SPORT_LABELS[tournament.sport as keyof typeof SPORT_LABELS];
  const isCreator = currentPlayerId === tournament.created_by;
  const canStart = isCreator && tournament.status === "registration" && participantCount >= 2;

  // Find the match being reported to get player names
  const reportMatch = reportingMatch
    ? (matches.find((m) => (m as { id: string }).id === reportingMatch) as Record<string, unknown> | undefined)
    : null;

  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link href="/tournament" className="mb-2 flex items-center gap-1 text-sm text-[#3D5A3E] hover:text-[#3D5A3E]">
            <ArrowLeft className="h-4 w-4" />
            Tournaments
          </Link>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-[#0A2E12] sm:text-xl truncate">{tournament.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#3D5A3E]">
                <span style={{ color: sportColor.primary }}>
                  <SportIcon sport={tournament.sport as Sport} className="w-4 h-4 inline-block" /> {sportLabel?.label ?? tournament.sport}
                </span>
                <span>{TOURNAMENT_FORMAT_LABELS[tournament.format]}</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {participantCount}/{tournament.max_players}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {canStart && (
                <button
                  onClick={handleStartTournament}
                  className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-500 min-h-[44px] touch-manipulation"
                >
                  <Play className="h-4 w-4" />
                  Start
                </button>
              )}
              <JoinTournamentButton
                tournamentId={tournament.id}
                isJoined={isJoined}
                isFull={participantCount >= tournament.max_players}
                status={tournament.status}
                onToggle={fetchData}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <Tabs.Root defaultValue="bracket">
          <Tabs.List className="mb-6 flex gap-1 rounded-xl bg-white/80 p-1">
            <Tabs.Trigger
              value="bracket"
              className="flex-1 rounded-lg px-3 py-3 text-sm font-medium text-[#3D5A3E] transition-colors data-[state=active]:bg-[#0A2E12]/5 data-[state=active]:text-[#0A2E12] min-h-[44px] touch-manipulation"
            >
              <Trophy className="mr-1.5 inline h-4 w-4" />
              Bracket
            </Tabs.Trigger>
            <Tabs.Trigger
              value="standings"
              className="flex-1 rounded-lg px-3 py-3 text-sm font-medium text-[#3D5A3E] transition-colors data-[state=active]:bg-[#0A2E12]/5 data-[state=active]:text-[#0A2E12] min-h-[44px] touch-manipulation"
            >
              Standings
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="bracket">
            {tournament.format === "round_robin" ? (
              <RoundRobinView
                matches={matches as unknown as Parameters<typeof RoundRobinView>[0]["matches"]}
                onReportResult={(matchId) => setReportingMatch(matchId)}
                currentPlayerId={currentPlayerId ?? undefined}
              />
            ) : tournament.format === "single_elimination" ? (
              <BracketView
                matches={matches as unknown as Parameters<typeof BracketView>[0]["matches"]}
                onReportResult={(matchId) => setReportingMatch(matchId)}
                currentPlayerId={currentPlayerId ?? undefined}
              />
            ) : (
              <TournamentBracket
                matches={matches as unknown as Parameters<typeof TournamentBracket>[0]["matches"]}
                format={tournament.format}
                onReportResult={(matchId) => setReportingMatch(matchId)}
                currentPlayerId={currentPlayerId ?? undefined}
              />
            )}
          </Tabs.Content>

          <Tabs.Content value="standings">
            <TournamentStandings
              standings={standings as unknown as Parameters<typeof TournamentStandings>[0]["standings"]}
            />
          </Tabs.Content>
        </Tabs.Root>

        {/* Report Result Modal */}
        {reportingMatch && reportMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-2xl"
            >
              <h3 className="mb-4 text-lg font-bold text-[#0A2E12]">Report Result</h3>
              <form onSubmit={handleReportResult} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#3D5A3E]">Winner</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: (reportMatch.player1_id ?? "") as string, name: ((reportMatch.player1 as Record<string, string> | null)?.display_name ?? "Player 1") },
                      { id: (reportMatch.player2_id ?? "") as string, name: ((reportMatch.player2 as Record<string, string> | null)?.display_name ?? "Player 2") },
                    ].filter(p => p.id).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setWinnerId(p.id)}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-left",
                          winnerId === p.id
                            ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                            : "border-[#0A2E12]/10 bg-[#0A2E12]/5 text-[#3D5A3E] hover:border-[#0A2E12]/10"
                        )}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#3D5A3E]">Score</label>
                  <input
                    type="text"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. 21-15"
                    className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-4 py-3 text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReportingMatch(null);
                      setScore("");
                      setWinnerId("");
                    }}
                    className="flex-1 rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/5 px-4 py-3 text-sm font-semibold text-[#3D5A3E] hover:border-[#0A2E12]/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!winnerId}
                    className="flex-1 rounded-xl bg-[#1B5E20] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1B5E20] disabled:opacity-50"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
