"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Trophy,
  X as XIcon,
  Clock,
  Users,
  ChevronDown,
  Filter,
} from "lucide-react";
import { SPORT_LABELS, ALL_SPORTS, type Sport } from "@/lib/types";
import { getSportColor, ANIMATIONS } from "@/lib/design";
import { cn } from "@/lib/utils";

interface MatchHistoryEntry {
  id: string;
  sport: string;
  started_at: string | null;
  ended_at: string | null;
  courts: { name: string } | null;
  match_players: {
    player_id: string;
    team: number | null;
    players: { id: string; display_name: string; avatar_url: string | null };
  }[];
  match_results: {
    winner_team: number | null;
    team1_score: number | null;
    team2_score: number | null;
  }[];
}

interface MatchHistoryDetailProps {
  playerId: string;
}

function formatDuration(startedAt: string | null, endedAt: string | null): string | null {
  if (!startedAt || !endedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  const diffMs = end - start;
  if (diffMs <= 0) return null;
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
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

export function MatchHistoryDetail({ playerId }: MatchHistoryDetailProps) {
  const [matches, setMatches] = useState<MatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const PAGE_SIZE = 20;

  const fetchHistory = useCallback(
    async (offset: number, append: boolean) => {
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(offset),
        });
        if (sportFilter) params.set("sport", sportFilter);

        const res = await fetch(`/api/match-history?${params}`);
        if (res.ok) {
          const data = await res.json();
          const fetched: MatchHistoryEntry[] = data.matches ?? [];
          setMatches((prev) => (append ? [...prev, ...fetched] : fetched));
          setHasMore(fetched.length >= PAGE_SIZE);
        }
      } catch {
        // ignore
      }
    },
    [sportFilter]
  );

  useEffect(() => {
    setLoading(true);
    fetchHistory(0, false).then(() => setLoading(false));
  }, [fetchHistory]);

  const loadMore = async () => {
    setLoadingMore(true);
    await fetchHistory(matches.length, true);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sport Filter */}
      <div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          <Filter className="h-3.5 w-3.5" />
          {sportFilter
            ? SPORT_LABELS[sportFilter as Sport]?.short ?? sportFilter
            : "All Sports"}
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              showFilters && "rotate-180"
            )}
          />
        </button>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 flex flex-wrap gap-1.5"
          >
            <button
              onClick={() => {
                setSportFilter(null);
                setShowFilters(false);
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                !sportFilter
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              All
            </button>
            {ALL_SPORTS.map((sport) => {
              const label = SPORT_LABELS[sport];
              const color = getSportColor(sport);
              const active = sportFilter === sport;
              return (
                <button
                  key={sport}
                  onClick={() => {
                    setSportFilter(sport);
                    setShowFilters(false);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  )}
                  style={active ? { backgroundColor: color.primary } : undefined}
                >
                  {label.emoji} {label.short}
                </button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Match List */}
      {matches.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-3xl">🏆</div>
          <p className="mt-2 text-sm text-zinc-500">
            {sportFilter ? "No matches for this sport yet" : "No match history yet"}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Play some games and your history will appear here
          </p>
        </div>
      ) : (
        <motion.div
          className="space-y-3"
          {...ANIMATIONS.staggerChildren}
          initial="initial"
          animate="animate"
        >
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} playerId={playerId} />
          ))}
        </motion.div>
      )}

      {/* Load More */}
      {hasMore && matches.length > 0 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 disabled:opacity-50"
          >
            {loadingMore ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  playerId,
}: {
  match: MatchHistoryEntry;
  playerId: string;
}) {
  const sportLabel = SPORT_LABELS[match.sport as keyof typeof SPORT_LABELS];
  const sportColor = getSportColor(match.sport);
  const result = match.match_results?.[0];
  const myTeam = match.match_players.find(
    (mp) => mp.player_id === playerId
  )?.team;
  const isWin =
    result && result.winner_team !== null && myTeam === result.winner_team;
  const isLoss =
    result &&
    result.winner_team !== null &&
    myTeam !== null &&
    myTeam !== result.winner_team;
  const isDraw = result && result.winner_team === null;
  const duration = formatDuration(match.started_at, match.ended_at);

  // Separate players into partner(s) and opponent(s)
  const partners = match.match_players.filter(
    (mp) => mp.player_id !== playerId && mp.team === myTeam
  );
  const opponents = match.match_players.filter(
    (mp) => mp.team !== null && mp.team !== myTeam
  );

  return (
    <motion.div
      {...ANIMATIONS.fadeInUp}
      className={cn(
        "overflow-hidden rounded-2xl border bg-white",
        isWin
          ? "border-emerald-200"
          : isLoss
            ? "border-red-200"
            : "border-zinc-200"
      )}
    >
      {/* Result banner */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 text-xs font-semibold",
          isWin
            ? "bg-emerald-50 text-emerald-600"
            : isLoss
              ? "bg-red-50 text-red-500"
              : "bg-zinc-50 text-zinc-500"
        )}
      >
        <div className="flex items-center gap-1.5">
          {isWin && <Trophy className="h-3.5 w-3.5" />}
          {isLoss && <XIcon className="h-3.5 w-3.5" />}
          <span>
            {isWin ? "VICTORY" : isLoss ? "DEFEAT" : isDraw ? "DRAW" : "PLAYED"}
          </span>
        </div>
        {result && result.team1_score !== null && (
          <span className="text-sm font-bold">
            {myTeam === 1
              ? `${result.team1_score} - ${result.team2_score}`
              : `${result.team2_score} - ${result.team1_score}`}
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Sport & Date row */}
        <div className="mb-3 flex items-center justify-between">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${sportColor.primary}15`,
              color: sportColor.primary,
            }}
          >
            {sportLabel?.emoji} {sportLabel?.label ?? match.sport}
          </span>
          {match.ended_at && (
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Calendar className="h-3 w-3" />
              {formatDate(match.ended_at)}
            </span>
          )}
        </div>

        {/* Partner & Opponents */}
        <div className="mb-3 space-y-2">
          {partners.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-16 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Partner
              </span>
              <div className="flex items-center gap-1.5">
                {partners.map((p) => (
                  <PlayerChip key={p.player_id} player={p.players} />
                ))}
              </div>
            </div>
          )}
          {opponents.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-16 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                {opponents.length > 1 ? "Opponents" : "Opponent"}
              </span>
              <div className="flex items-center gap-1.5">
                {opponents.map((p) => (
                  <PlayerChip key={p.player_id} player={p.players} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Court & Duration footer */}
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          {match.courts?.name && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {match.courts.name}
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {match.match_players.length} players
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function PlayerChip({
  player,
}: {
  player: { id: string; display_name: string; avatar_url: string | null };
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-zinc-50 py-0.5 pl-0.5 pr-2.5">
      <div className="h-5 w-5 overflow-hidden rounded-full bg-zinc-200">
        {player.avatar_url ? (
          <img
            src={player.avatar_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-zinc-500">
            {player.display_name?.charAt(0)}
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-zinc-700">
        {player.display_name}
      </span>
    </div>
  );
}
