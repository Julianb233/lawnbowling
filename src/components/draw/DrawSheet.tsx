"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  BowlsTeamAssignment,
  BowlsCheckin,
  BowlsGameFormat,
} from "@/lib/types";
import { BOWLS_FORMAT_LABELS } from "@/lib/types";
import { RinkCard } from "./RinkCard";

interface DrawData {
  rinks: BowlsTeamAssignment[][];
  unassigned: BowlsCheckin[];
  rinkCount: number;
  format: BowlsGameFormat;
}

interface DrawSheetProps {
  draw: DrawData;
  currentUserId?: string;
  revealMode?: boolean;
  tournamentName?: string;
  drawDate?: string;
  roundNumber?: number;
  /** Hide actions (Find My Rink, Print) — useful for /tv embed */
  hideActions?: boolean;
}

export function DrawSheet({
  draw,
  currentUserId,
  revealMode = false,
  tournamentName,
  drawDate,
  roundNumber,
  hideActions = false,
}: DrawSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Check if current user is in the draw
  const userRinkIndex = currentUserId
    ? draw.rinks.findIndex((rink) =>
        rink.some((a) => a.player_id === currentUserId)
      )
    : -1;
  const showFindMe = currentUserId && userRinkIndex >= 0;

  function handleFindMe() {
    if (userRinkIndex < 0) return;
    const rinkEl = containerRef.current?.querySelector(
      `#rink-card-${userRinkIndex + 1}`
    );
    rinkEl?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const effectiveReveal = revealMode && !prefersReducedMotion;
  const today =
    drawDate ??
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div ref={containerRef} className="draw-sheet">
      {/* Reveal animation keyframes */}
      <style>{`
        @keyframes drawSheetFadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .draw-reveal-card {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
        @media print {
          .draw-sheet-actions { display: none !important; }
          .draw-sheet-print-header { display: block !important; }
          .draw-sheet .draw-rink-card { break-inside: avoid; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Print-only header */}
      <div className="draw-sheet-print-header hidden print:block print:text-center print:border-b-2 print:border-black print:pb-2 print:mb-4">
        {tournamentName && (
          <h1 className="text-2xl font-black">{tournamentName}</h1>
        )}
        <p className="text-sm">
          {BOWLS_FORMAT_LABELS[draw.format].label}
          {roundNumber && <> &mdash; Round {roundNumber}</>}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{today}</p>
      </div>

      {/* Action buttons (hidden in print) */}
      {!hideActions && (
        <div className="draw-sheet-actions flex flex-wrap items-center gap-2 mb-4">
          {showFindMe && (
            <button
              onClick={handleFindMe}
              className="rounded-xl bg-[#1B5E20] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#145218] transition-colors min-h-[44px] touch-manipulation"
            >
              Find My Rink
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:bg-background transition-colors min-h-[44px] touch-manipulation"
          >
            Print Draw Sheet
          </button>
        </div>
      )}

      {/* Rink cards grid */}
      <div
        className={cn(
          "grid gap-4",
          "grid-cols-1",
          "sm:grid-cols-2",
          "xl:grid-cols-3",
          // Print: two-column grid
          "print:grid-cols-2 print:gap-2"
        )}
      >
        {draw.rinks.map((rink, idx) => (
          <RinkCard
            key={idx}
            rinkNumber={idx + 1}
            assignments={rink}
            highlightUserId={currentUserId}
            revealMode={effectiveReveal}
            animationDelay={effectiveReveal ? idx * 50 : 0}
          />
        ))}
      </div>

      {/* Unassigned / Bye players */}
      {draw.unassigned.length > 0 && (
        <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 print:rounded-none print:border-black print:bg-white dark:bg-card">
          <h3 className="mb-2 text-sm font-bold text-amber-800 print:text-black">
            Bye ({draw.unassigned.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {draw.unassigned.map((u) => (
              <span
                key={u.player_id}
                className="rounded-full bg-amber-200/60 px-3 py-1 text-xs font-medium text-amber-800 print:bg-white dark:bg-card print:border print:border-black print:text-black"
              >
                {u.player?.display_name ?? "Unknown"}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
