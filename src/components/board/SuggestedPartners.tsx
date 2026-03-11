"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPORT_LABELS } from "@/lib/types";
import { getSportColor } from "@/lib/design";
import type { Player, Sport } from "@/lib/types";
import type { MatchMode, MatchQuality } from "@/lib/matchmaking";

interface SuggestionData {
  player: Player;
  score: number;
  reasons: string[];
  commonSports: string[];
  eloDiff: number | null;
  matchQuality: MatchQuality;
}

interface SuggestedPartnersProps {
  currentPlayerId: string | null;
  sportFilter: string | null;
  onPickMe?: (player: Player) => void;
  pendingTargetIds?: Set<string>;
}

const MODE_OPTIONS: { value: MatchMode; label: string; desc: string }[] = [
  { value: "auto", label: "Smart", desc: "Balanced matching" },
  { value: "competitive", label: "Competitive", desc: "Similar skill level" },
  { value: "learning", label: "Learning", desc: "Wider skill range" },
];

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "text-green-400 bg-green-500/10 ring-green-500/30"
      : score >= 50
        ? "text-amber-400 bg-amber-500/10 ring-amber-500/30"
        : "text-zinc-400 bg-zinc-500/10 ring-zinc-500/30";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ring-1", color)}>
      {Math.round(score)}%
    </span>
  );
}

function QualityIndicator({ quality }: { quality: MatchQuality }) {
  const labels: Record<MatchQuality["overall"], { text: string; color: string }> = {
    great: { text: "Great match", color: "text-green-500" },
    good: { text: "Good match", color: "text-amber-500" },
    fair: { text: "Fair match", color: "text-zinc-500" },
  };
  const { text, color } = labels[quality.overall];
  return <span className={cn("text-xs font-medium", color)}>{text}</span>;
}

function SuggestionCard({ suggestion, index, onPickMe, isPending }: {
  suggestion: SuggestionData; index: number; onPickMe?: (player: Player) => void; isPending?: boolean;
}) {
  const { player, score, reasons, commonSports, eloDiff, matchQuality } = suggestion;
  const primarySport = commonSports[0] ?? player.sports[0];
  const sportColor = getSportColor(primarySport);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.02 }}
      className="relative flex items-center gap-3 rounded-xl p-3 glass hover:border-zinc-300 transition-all cursor-pointer touch-manipulation"
      onClick={() => !isPending && onPickMe?.(player)}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
        style={{ background: `linear-gradient(135deg, ${sportColor.primary}, ${sportColor.primary}99)` }}>
        #{index + 1}
      </div>
      <div className="relative shrink-0">
        {player.avatar_url ? (
          <img src={player.avatar_url} alt={player.display_name} className={cn("h-10 w-10 rounded-full object-cover ring-2", sportColor.ring)} />
        ) : (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ring-2", `bg-gradient-to-br ${sportColor.gradient}`, sportColor.ring)}>
            {player.display_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-semibold text-zinc-900">{player.display_name}</h4>
          <ScoreBadge score={score} />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          {commonSports.map((sport: string) => {
            const info = SPORT_LABELS[sport as Sport];
            return info ? (
              <span key={sport} className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-xs font-medium", getSportColor(sport).bg, "text-zinc-500")}>
                {info.emoji} {info.short}
              </span>
            ) : null;
          })}
          {eloDiff !== null && <span className="text-xs text-zinc-500">{eloDiff <= 50 ? "~same level" : `${eloDiff} ELO diff`}</span>}
          <QualityIndicator quality={matchQuality} />
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-500">{reasons.slice(0, 2).join(" \u00b7 ")}</p>
      </div>
      <motion.button
        whileHover={isPending ? {} : { scale: 1.05 }} whileTap={isPending ? {} : { scale: 0.95 }}
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (!isPending) onPickMe?.(player); }}
        disabled={isPending}
        className={cn("shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow transition-all min-h-[36px] touch-manipulation", `bg-gradient-to-r ${sportColor.gradient}`, isPending && "opacity-60 cursor-not-allowed")}
      >
        {isPending ? "SENT" : "PICK"}
      </motion.button>
    </motion.div>
  );
}

export function SuggestedPartners({ currentPlayerId, sportFilter, onPickMe, pendingTargetIds }: SuggestedPartnersProps) {
  const [suggestions, setSuggestions] = useState<SuggestionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoMatch, setAutoMatch] = useState(false);
  const [mode, setMode] = useState<MatchMode>("auto");

  const fetchSuggestions = useCallback(async () => {
    if (!currentPlayerId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sportFilter) params.set("sport", sportFilter);
      params.set("mode", mode);
      params.set("limit", "5");
      const res = await fetch(`/api/matchmaking/suggestions?${params}`);
      if (res.ok) { const data = await res.json(); setSuggestions(data.suggestions ?? []); }
    } catch { /* suggestions are non-critical */ } finally { setLoading(false); }
  }, [currentPlayerId, sportFilter, mode]);

  useEffect(() => {
    fetchSuggestions();
    const interval = setInterval(fetchSuggestions, 30000);
    return () => clearInterval(interval);
  }, [fetchSuggestions]);

  useEffect(() => {
    if (autoMatch && suggestions.length > 0 && onPickMe) {
      const top = suggestions[0];
      if (!pendingTargetIds?.has(top.player.id)) { onPickMe(top.player); setAutoMatch(false); }
    }
  }, [autoMatch, suggestions, onPickMe, pendingTargetIds]);

  if (!currentPlayerId) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">{"\u2728"} Suggested Partners</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-zinc-100 p-0.5">
            {MODE_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setMode(opt.value)} title={opt.desc}
                className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium transition-all",
                  mode === opt.value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-600")}>
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { if (autoMatch) { setAutoMatch(false); } else { setAutoMatch(true); if (suggestions.length === 0) fetchSuggestions(); } }}
            className={cn("rounded-full px-3 py-1 text-xs font-medium transition-all",
              autoMatch ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/30" : "bg-zinc-100 text-zinc-500 hover:text-zinc-600 hover:bg-zinc-100")}>
            {autoMatch ? "Auto-matching..." : "Auto-match"}
          </button>
        </div>
      </div>
      {loading && suggestions.length === 0 ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => (<div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-50" />))}</div>
      ) : suggestions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center glass">
          <p className="text-sm text-zinc-500">No suggestions yet. Check in and wait for other players!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {suggestions.map((suggestion, i) => (
              <SuggestionCard key={suggestion.player.id} suggestion={suggestion} index={i} onPickMe={onPickMe} isPending={pendingTargetIds?.has(suggestion.player.id)} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
