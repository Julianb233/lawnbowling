"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  Filter,
  MapPin,
  Trophy,
  Users,
  X as XIcon,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { SPORT_LABELS } from "@/lib/types";
import { SportIcon } from "@/components/icons/SportIcon";
import { getSportColor, ANIMATIONS } from "@/lib/design";
import type { Sport } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MatchPlayer {
  player_id: string;
  team: number | null;
  players: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

interface MatchHistoryEntry {
  id: string;
  sport: string;
  started_at: string | null;
  ended_at: string | null;
  courts: { name: string } | null;
  match_players: MatchPlayer[];
  match_results: {
    winner_team: number | null;
    team1_score: number | null;
    team2_score: number | null;
  }[];
}

function formatDuration(startedAt: string | null, endedAt: string | null): string | null {
  if (!startedAt || !endedAt) return null;
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  if (ms <= 0) return null;
  const totalMins = Math.round(ms / 60000);
  if (totalMins < 60) return `${totalMins}m`;
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

const SPORTS_FILTER = [
  { value: "", label: "All Sports" },
  { value: "pickleball", label: "Pickleball" },
  { value: "tennis", label: "Tennis" },
  { value: "badminton", label: "Badminton" },
  { value: "racquetball", label: "Racquetball" },
  { value: "lawn_bowling", label: "Lawn Bowling" },
  { value: "flag_football", label: "Flag Football" },
];

export default function MatchHistoryPage() {
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sportFilter, setSportFilter] = useState("");
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 15;

  // Get current user's player ID
  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: player } = await supabase
          .from("players")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (player) setCurrentPlayerId(player.id);
      }
    }
    loadUser();
  }, []);

  const fetchHistory = useCallback(
    async (offset = 0, append = false) => {
      if (!currentPlayerId) return;
      if (!append) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          history: "true",
          limit: String(PAGE_SIZE),
          offset: String(offset),
        });
        if (sportFilter) params.set("sport", sportFilter);

        const res = await fetch(`/api/stats/${currentPlayerId}?${params}`);
        if (res.ok) {
          const data = await res.json();
          const history = data.history ?? [];
          if (append) {
            setMatches((prev) => [...prev, ...history]);
          } else {
            setMatches(history);
          }
          setHasMore(history.length === PAGE_SIZE);
        }
      } catch {
        // ignore
      }
      setLoading(false);
      setLoadingMore(false);
    },
    [currentPlayerId, sportFilter]
  );

  useEffect(() => {
    if (currentPlayerId) fetchHistory();
  }, [currentPlayerId, fetchHistory]);

  // Stats summary from loaded matches
  const totalMatches = matches.length;
  const wins = matches.filter((m) => {
    const result = m.match_results?.[0];
    const myTeam = m.match_players.find((mp) => mp.player_id === currentPlayerId)?.team;
    return result && result.winner_team !== null && myTeam === result.winner_team;
  }).length;

  return (
    <div className="min-h-screen bg-[#FEFCF9] dark:bg-[#0f2518] pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#1a3d28]/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/stats" className="rounded-lg p-1.5 hover:bg-zinc-100">
              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Match History</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {totalMatches} match{totalMatches !== 1 ? "es" : ""} loaded
                {totalMatches > 0 && ` -- ${wins}W / ${totalMatches - wins}L`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Sport Filter */}
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 shrink-0 text-zinc-400" />
          {SPORTS_FILTER.map((s) => (
            <button
              key={s.value}
              onClick={() => setSportFilter(s.value)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                sportFilter === s.value
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Match List */}
      <div className="mx-auto max-w-3xl space-y-2 px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-100" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="py-16 text-center">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No matches found</p>
            <p className="text-xs text-zinc-400">
              {sportFilter
                ? "Try a different sport filter"
                : "Play some games to see your history here"}
            </p>
          </div>
        ) : (
          <motion.div
            className="space-y-2"
            {...ANIMATIONS.staggerChildren}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence>
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  currentPlayerId={currentPlayerId!}
                  expanded={expandedMatch === match.id}
                  onToggle={() =>
                    setExpandedMatch((prev) => (prev === match.id ? null : match.id))
                  }
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Load More */}
        {hasMore && !loading && matches.length > 0 && (
          <button
            onClick={() => fetchHistory(matches.length, true)}
            disabled={loadingMore}
            className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-200 disabled:opacity-50"
          >
            {loadingMore ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function MatchCard({
  match,
  currentPlayerId,
  expanded,
  onToggle,
}: {
  match: MatchHistoryEntry;
  currentPlayerId: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sportLabel = SPORT_LABELS[match.sport as keyof typeof SPORT_LABELS];
  const sportColor = getSportColor(match.sport);
  const result = match.match_results?.[0];
  const myTeam = match.match_players.find((mp) => mp.player_id === currentPlayerId)?.team;
  const isWin = result && result.winner_team !== null && myTeam === result.winner_team;
  const isLoss = result && result.winner_team !== null && myTeam !== null && myTeam !== result.winner_team;
  const duration = formatDuration(match.started_at, match.ended_at);

  // Split players by team
  const myTeamPlayers = match.match_players.filter((mp) => mp.team === myTeam);
  const opponentPlayers = match.match_players.filter((mp) => mp.team !== myTeam);
  const partner = myTeamPlayers.find((mp) => mp.player_id !== currentPlayerId);

  return (
    <motion.div
      {...ANIMATIONS.fadeInUp}
      layout
      className={cn(
        "overflow-hidden rounded-xl border transition-colors",
        isWin
          ? "border-[#1B5E20]/15 bg-[#1B5E20]/5"
          : isLoss
            ? "border-red-200 bg-red-50/30"
            : "border-zinc-200 bg-zinc-50 dark:bg-white/5"
      )}
    >
      {/* Main row - always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        {/* Win/Loss indicator bar */}
        <div
          className={cn(
            "h-12 w-1 shrink-0 rounded-full",
            isWin ? "bg-[#1B5E20]" : isLoss ? "bg-red-400" : "bg-zinc-300"
          )}
        />

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${sportColor.primary}15`,
                color: sportColor.primary,
              }}
            >
              <SportIcon sport={match.sport as Sport} className="w-3 h-3 inline-block" /> {sportLabel?.short ?? match.sport}
            </span>
            {isWin && (
              <span className="flex items-center gap-0.5 text-xs font-bold text-[#1B5E20]">
                <Trophy className="h-3 w-3" /> WIN
              </span>
            )}
            {isLoss && (
              <span className="flex items-center gap-0.5 text-xs font-bold text-red-500">
                <XIcon className="h-3 w-3" /> LOSS
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            {match.ended_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(match.ended_at)}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {duration}
              </span>
            )}
            {match.courts?.name && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {match.courts.name}
              </span>
            )}
          </div>

          {/* Partner name */}
          {partner && (
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              with <span className="font-medium">{partner.players.display_name}</span>
            </p>
          )}
        </div>

        {/* Score */}
        <div className="shrink-0 text-right">
          {result && result.team1_score !== null ? (
            <div className="text-lg font-bold tabular-nums text-zinc-800">
              <span className={myTeam === 1 ? (isWin ? "text-[#1B5E20]" : "text-red-500") : "text-zinc-400"}>
                {result.team1_score}
              </span>
              <span className="mx-1 text-zinc-300">-</span>
              <span className={myTeam === 2 ? (isWin ? "text-[#1B5E20]" : "text-red-500") : "text-zinc-400"}>
                {result.team2_score}
              </span>
            </div>
          ) : (
            <span className="text-xs text-zinc-400">No score</span>
          )}
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 text-zinc-400 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-200 px-4 py-3 space-y-3">
              {/* Teams breakdown */}
              <div className="grid grid-cols-2 gap-3">
                {/* Your team */}
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Your Team
                  </p>
                  <div className="space-y-1.5">
                    {myTeamPlayers.map((mp) => (
                      <PlayerRow
                        key={mp.player_id}
                        player={mp.players}
                        isYou={mp.player_id === currentPlayerId}
                      />
                    ))}
                  </div>
                </div>

                {/* Opponents */}
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Opponents
                  </p>
                  <div className="space-y-1.5">
                    {opponentPlayers.map((mp) => (
                      <PlayerRow key={mp.player_id} player={mp.players} />
                    ))}
                    {opponentPlayers.length === 0 && (
                      <p className="text-xs text-zinc-400">Unknown</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Match details grid */}
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-white dark:bg-[#1a3d28] p-2.5">
                <DetailCell
                  label="Date"
                  value={
                    match.ended_at
                      ? new Date(match.ended_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })
                      : "--"
                  }
                />
                <DetailCell
                  label="Duration"
                  value={duration ?? "--"}
                />
                <DetailCell
                  label="Court"
                  value={match.courts?.name ?? "--"}
                />
              </div>

              {/* Time range */}
              {match.started_at && match.ended_at && (
                <p className="text-center text-[10px] text-zinc-400">
                  {new Date(match.started_at).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  --{" "}
                  {new Date(match.ended_at).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PlayerRow({
  player,
  isYou,
}: {
  player: { id: string; display_name: string; avatar_url: string | null };
  isYou?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "h-6 w-6 shrink-0 overflow-hidden rounded-full border-2",
          isYou ? "border-[#1B5E20]" : "border-zinc-200"
        )}
      >
        {player.avatar_url ? (
          <img src={player.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
            {player.display_name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>
      <span className="truncate text-xs font-medium text-zinc-700">
        {isYou ? "You" : player.display_name}
      </span>
    </div>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-zinc-400">{label}</p>
      <p className="text-xs font-medium text-zinc-700">{value}</p>
    </div>
  );
}
