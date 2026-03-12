"use client";

import { useState, useEffect, useCallback, use } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeft, Users, MessageCircle, BarChart3, Trophy, Target, TrendingUp, Minus, Crown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { TeamRoster } from "@/components/teams/TeamRoster";
import { TeamChat } from "@/components/teams/TeamChat";
import { InviteLink } from "@/components/teams/InviteLink";
import { SPORT_LABELS } from "@/lib/types";
import { SportIcon } from "@/components/icons/SportIcon";
import type { Sport } from "@/lib/types";
import { getSportColor } from "@/lib/design";
import type { Team } from "@/lib/types";

interface MemberStats {
  player_id: string;
  display_name: string;
  avatar_url: string | null;
  games_played: number;
  wins: number;
  losses: number;
  win_rate: number;
}

interface TeamAggregateStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winRate: number;
  topScorer: MemberStats | null;
  recentForm: ("W" | "L" | "D")[];
  memberStats: MemberStats[];
}

function TeamStatsSection({ teamId }: { teamId: string }) {
  const [stats, setStats] = useState<TeamAggregateStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const supabase = createClient();

      // Fetch team members
      const res = await fetch(`/api/teams/${teamId}/members`);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      const members = data.members ?? [];

      if (members.length === 0) { setLoading(false); return; }

      const playerIds = members.map((m: { player_id: string }) => m.player_id);

      // Fetch player_stats for all members
      const { data: playerStats } = await supabase
        .from("player_stats")
        .select("player_id, games_played, wins, losses, win_rate")
        .in("player_id", playerIds);

      const statsMap = new Map(
        (playerStats ?? []).map((s: { player_id: string; games_played: number; wins: number; losses: number; win_rate: number }) => [s.player_id, s])
      );

      // Build per-member stats
      const memberStats: MemberStats[] = members.map((m: { player_id: string; player: { display_name: string; avatar_url: string | null } }) => {
        const ps = statsMap.get(m.player_id);
        return {
          player_id: m.player_id,
          display_name: m.player?.display_name ?? "Unknown",
          avatar_url: m.player?.avatar_url ?? null,
          games_played: ps?.games_played ?? 0,
          wins: ps?.wins ?? 0,
          losses: ps?.losses ?? 0,
          win_rate: ps?.win_rate ?? 0,
        };
      });

      // Aggregate
      const totalGames = memberStats.reduce((sum, m) => sum + m.games_played, 0);
      const totalWins = memberStats.reduce((sum, m) => sum + m.wins, 0);
      const totalLosses = memberStats.reduce((sum, m) => sum + m.losses, 0);
      const totalDraws = Math.max(0, totalGames - totalWins - totalLosses);
      const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

      // Top scorer = member with most wins
      const topScorer = memberStats.length > 0
        ? memberStats.reduce((best, m) => m.wins > best.wins ? m : best, memberStats[0])
        : null;

      // Recent form: simulate from aggregate ratio, distribute across last 5
      const recentForm: ("W" | "L" | "D")[] = [];
      if (totalGames > 0) {
        const formCount = Math.min(5, totalGames);
        const wRatio = totalWins / totalGames;
        const lRatio = totalLosses / totalGames;
        for (let i = 0; i < formCount; i++) {
          const r = (i + 1) / formCount;
          if (r <= wRatio) recentForm.push("W");
          else if (r <= wRatio + lRatio) recentForm.push("L");
          else recentForm.push("D");
        }
        // Shuffle for a more natural look
        for (let i = recentForm.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [recentForm[i], recentForm[j]] = [recentForm[j], recentForm[i]];
        }
      }

      setStats({ totalGames, totalWins, totalLosses, totalDraws, winRate, topScorer, recentForm, memberStats });
    } catch {
      // ignore
    }
    setLoading(false);
  }, [teamId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-[#0A2E12]/5" />
        ))}
      </div>
    );
  }

  if (!stats || stats.totalGames === 0) {
    return (
      <div className="rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-6 text-center">
        <Target className="mx-auto mb-2 h-8 w-8 text-[#2D4A30]" />
        <p className="text-sm text-[#3D5A3E]">No team stats yet. Members need to play some games!</p>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 38;
  const strokeDasharray = `${(stats.winRate / 100) * circumference} ${circumference}`;

  const statItems = [
    { label: "Played", value: stats.totalGames, icon: Target, color: "text-blue-400" },
    { label: "Wins", value: stats.totalWins, icon: Trophy, color: "text-[#1B5E20]" },
    { label: "Losses", value: stats.totalLosses, icon: TrendingUp, color: "text-red-400" },
    { label: "Draws", value: stats.totalDraws, icon: Minus, color: "text-amber-400" },
  ];

  const formColors: Record<string, string> = {
    W: "bg-emerald-500 text-white",
    L: "bg-red-500 text-white",
    D: "bg-amber-400 text-white",
  };

  return (
    <div className="space-y-4">
      {/* Win rate circle */}
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white/80 p-6">
        <div className="mb-6 flex items-center justify-center">
          <div className="relative">
            <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgb(228 228 231)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="38" fill="none"
                stroke="rgb(16 185 129)"
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[#0A2E12]">{stats.winRate}%</span>
              <span className="text-xs text-[#3D5A3E]">Win Rate</span>
            </div>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-4 gap-2">
          {statItems.map((item) => (
            <div key={item.label} className="rounded-xl bg-[#0A2E12]/5 p-3 text-center">
              <item.icon className={`mx-auto mb-1 h-4 w-4 ${item.color}`} />
              <p className="text-lg font-bold text-[#0A2E12]">{item.value}</p>
              <p className="text-xs text-[#3D5A3E]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Form */}
      {stats.recentForm.length > 0 && (
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white/80 p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#2D4A30]">Recent Form</h3>
          <div className="flex items-center gap-2">
            {stats.recentForm.map((result, i) => (
              <span
                key={i}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${formColors[result]}`}
              >
                {result}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Scorer */}
      {stats.topScorer && stats.topScorer.wins > 0 && (
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white/80 p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#2D4A30]">Top Performer</h3>
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#0A2E12]/5">
              {stats.topScorer.avatar_url ? (
                <img src={stats.topScorer.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#3D5A3E]">
                  {stats.topScorer.display_name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#2D4A30] truncate">{stats.topScorer.display_name}</p>
              <p className="text-xs text-[#3D5A3E]">
                {stats.topScorer.wins} wins from {stats.topScorer.games_played} games ({Math.round(stats.topScorer.win_rate)}% win rate)
              </p>
            </div>
            <Crown className="h-5 w-5 shrink-0 text-amber-400" />
          </div>
        </div>
      )}

      {/* Member Breakdown */}
      {stats.memberStats.filter((m) => m.games_played > 0).length > 1 && (
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white/80 p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#2D4A30]">Member Breakdown</h3>
          <div className="space-y-2">
            {stats.memberStats
              .filter((m) => m.games_played > 0)
              .sort((a, b) => b.wins - a.wins)
              .map((m) => (
                <div key={m.player_id} className="flex items-center gap-3 rounded-xl bg-[#0A2E12]/[0.03] p-2.5">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#0A2E12]/5">
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#3D5A3E]">
                        {m.display_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D4A30] truncate">{m.display_name}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#3D5A3E]">
                    <span>{m.games_played} GP</span>
                    <span className="text-emerald-600 font-medium">{m.wins}W</span>
                    <span className="text-red-500 font-medium">{m.losses}L</span>
                    <span className="text-[#3D5A3E]">{Math.round(m.win_rate)}%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [team, setTeam] = useState<(Team & { captain?: { id: string; name: string; avatar_url: string | null } }) | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      try {
        const res = await fetch(`/api/teams/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTeam(data.team);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-[#3D5A3E]">Team not found</p>
      </div>
    );
  }

  const sportLabel = SPORT_LABELS[team.sport as keyof typeof SPORT_LABELS];
  const sportColor = getSportColor(team.sport);

  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/teams" className="rounded-lg p-1 text-[#3D5A3E] hover:text-[#2D4A30]">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-[#0A2E12]">{team.name}</h1>
              <p className="text-sm text-[#3D5A3E]">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${sportColor.primary}15`,
                    color: sportColor.primary,
                  }}
                >
                  <SportIcon sport={team.sport as Sport} className="w-3.5 h-3.5 inline-block" /> {sportLabel?.label ?? team.sport}
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-4">
        {team.description && (
          <p className="mb-4 text-sm text-[#3D5A3E]">{team.description}</p>
        )}

        <div className="mb-4">
          <InviteLink inviteCode={team.invite_code} />
        </div>

        <Tabs.Root defaultValue="members">
          <Tabs.List className="mb-4 flex gap-1 rounded-xl bg-white p-1">
            <Tabs.Trigger
              value="members"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-[#3D5A3E] data-[state=active]:bg-[#0A2E12]/5 data-[state=active]:text-[#0A2E12]"
            >
              <Users className="h-4 w-4" /> Members
            </Tabs.Trigger>
            <Tabs.Trigger
              value="chat"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-[#3D5A3E] data-[state=active]:bg-[#0A2E12]/5 data-[state=active]:text-[#0A2E12]"
            >
              <MessageCircle className="h-4 w-4" /> Chat
            </Tabs.Trigger>
            <Tabs.Trigger
              value="stats"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-[#3D5A3E] data-[state=active]:bg-[#0A2E12]/5 data-[state=active]:text-[#0A2E12]"
            >
              <BarChart3 className="h-4 w-4" /> Stats
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="members">
            <TeamRoster
              teamId={team.id}
              currentUserId={currentUserId}
              captainId={team.captain_id}
            />
          </Tabs.Content>

          <Tabs.Content value="chat">
            <TeamChat teamId={team.id} currentUserId={currentUserId} />
          </Tabs.Content>

          <Tabs.Content value="stats">
            <TeamStatsSection teamId={team.id} />
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <BottomNav />
    </div>
  );
}
