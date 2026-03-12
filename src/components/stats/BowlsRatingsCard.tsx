"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getRatingTier } from "@/lib/elo";
import { BOWLS_POSITION_LABELS } from "@/lib/types";
import type { BowlsPositionRating, BowlsRatingHistory, BowlsRatingPosition } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── Sparkline SVG ───────────────────────────────────────────────────

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (w - padding * 2);
    const y = h - padding - ((val - min) / range) * (h - padding * 2);
    return `${x},${y}`;
  });

  const isUpTrend = data[data.length - 1] >= data[0];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-6 w-20", className)}
      preserveAspectRatio="none"
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={isUpTrend ? "#16a34a" : "#dc2626"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Tier Badge ──────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  expert: "bg-amber-100 text-amber-800 border-amber-200",
  advanced: "bg-purple-100 text-purple-800 border-purple-200",
  intermediate: "bg-blue-100 text-blue-800 border-blue-200",
  beginner: "bg-[#0A2E12]/5 text-[#3D5A3E] border-[#0A2E12]/10",
};

function TierBadge({ rating }: { rating: number }) {
  const tier = getRatingTier(rating);
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
        TIER_COLORS[tier] ?? TIER_COLORS.beginner
      )}
    >
      {tier}
    </span>
  );
}

// ─── Position Card ───────────────────────────────────────────────────

function PositionCard({
  rating,
  history,
}: {
  rating: BowlsPositionRating;
  history: number[];
}) {
  const posLabel =
    BOWLS_POSITION_LABELS[rating.position as keyof typeof BOWLS_POSITION_LABELS]?.label ??
    rating.position.charAt(0).toUpperCase() + rating.position.slice(1);

  return (
    <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]">
          {posLabel}
        </span>
        <TierBadge rating={rating.elo_rating} />
      </div>

      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-2xl font-black text-[#0A2E12] tabular-nums">
            {Math.round(rating.elo_rating)}
          </p>
          <p className="mt-0.5 text-xs text-[#3D5A3E]">
            {rating.games_played} games &middot; {rating.wins}W/{rating.losses}L
            {rating.draws > 0 ? `/${rating.draws}D` : ""}
          </p>
        </div>
        <Sparkline data={history} />
      </div>

      {/* Shot differential & ends won */}
      <div className="mt-3 flex gap-3 border-t border-[#0A2E12]/10 pt-3">
        <div className="flex-1">
          <p className="text-xs text-[#3D5A3E]">Shot Diff</p>
          <p
            className={cn(
              "text-sm font-bold tabular-nums",
              rating.shot_differential > 0
                ? "text-green-600"
                : rating.shot_differential < 0
                  ? "text-red-500"
                  : "text-[#3D5A3E]"
            )}
          >
            {rating.shot_differential > 0 ? "+" : ""}
            {rating.shot_differential}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-[#3D5A3E]">Ends Won</p>
          <p className="text-sm font-bold tabular-nums text-[#2D4A30]">
            {rating.ends_won_pct}%
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

interface BowlsRatingsCardProps {
  playerId: string;
}

export function BowlsRatingsCard({ playerId }: BowlsRatingsCardProps) {
  const [ratings, setRatings] = useState<BowlsPositionRating[]>([]);
  const [historyMap, setHistoryMap] = useState<Map<string, number[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(new Date().getFullYear().toString());
  const [showSeasonPicker, setShowSeasonPicker] = useState(false);

  const currentYear = new Date().getFullYear();
  const availableSeasons = Array.from({ length: 5 }, (_, i) =>
    (currentYear - i).toString()
  );

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: ratingsData } = await supabase
      .from("bowls_position_ratings")
      .select("*")
      .eq("player_id", playerId)
      .eq("season", season)
      .order("elo_rating", { ascending: false });

    const typedRatings = (ratingsData ?? []) as BowlsPositionRating[];
    setRatings(typedRatings);

    // Fetch history for sparklines
    const { data: historyData } = await supabase
      .from("bowls_rating_history")
      .select("position, elo_rating, created_at")
      .eq("player_id", playerId)
      .eq("season", season)
      .order("created_at", { ascending: true });

    const hMap = new Map<string, number[]>();
    for (const h of (historyData ?? []) as BowlsRatingHistory[]) {
      const arr = hMap.get(h.position) ?? [];
      arr.push(h.elo_rating);
      hMap.set(h.position, arr);
    }
    // Keep only last 10 entries per position
    for (const [key, arr] of hMap) {
      if (arr.length > 10) hMap.set(key, arr.slice(-10));
    }
    setHistoryMap(hMap);

    setLoading(false);
  }, [playerId, season]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-48 animate-pulse rounded bg-[#0A2E12]/5" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-[#0A2E12]/5" />
          ))}
        </div>
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white/80 p-6 text-center">
        <Target className="mx-auto mb-2 h-10 w-10 text-[#3D5A3E]" />
        <p className="text-sm text-[#3D5A3E]">
          No bowls position ratings yet. Play in tournaments to build your ratings!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#1B5E20]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#3D5A3E]">
            Position Ratings
          </h2>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSeasonPicker(!showSeasonPicker)}
            className="flex items-center gap-1 rounded-lg border border-[#0A2E12]/10 bg-white px-3 py-1.5 text-xs font-medium text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03]"
          >
            {season} Season
            <ChevronDown className="h-3 w-3" />
          </button>
          {showSeasonPicker && (
            <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-[#0A2E12]/10 bg-white py-1 shadow-lg">
              {availableSeasons.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSeason(s);
                    setShowSeasonPicker(false);
                  }}
                  className={cn(
                    "block w-full px-4 py-1.5 text-left text-xs",
                    s === season
                      ? "bg-[#1B5E20]/5 font-bold text-[#1B5E20]"
                      : "text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03]"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {ratings.map((rating) => (
          <PositionCard
            key={rating.position}
            rating={rating}
            history={historyMap.get(rating.position) ?? []}
          />
        ))}
      </motion.div>
    </div>
  );
}
