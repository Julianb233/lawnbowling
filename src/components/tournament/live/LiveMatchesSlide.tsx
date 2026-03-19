"use client";

import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, Swords } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MatchData {
  id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  score: string | null;
  status: string;
  player1?: { id: string; display_name: string; avatar_url: string | null } | null;
  player2?: { id: string; display_name: string; avatar_url: string | null } | null;
}

interface LiveMatchesSlideProps {
  matches: MatchData[];
  currentRound: number;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function LiveMatchesSlide({ matches, currentRound }: LiveMatchesSlideProps) {
  // Show in-progress matches first, then pending for current round, then recent completed
  const inProgress = matches.filter((m) => m.status === "in_progress");
  const pendingCurrentRound = matches.filter(
    (m) => m.status === "pending" && m.round === currentRound && m.player1_id && m.player2_id
  );
  const recentCompleted = matches
    .filter((m) => m.status === "completed")
    .sort((a, b) => b.round - a.round || b.match_number - a.match_number)
    .slice(0, 6);

  const sections = [
    { label: "In Progress", matches: inProgress, color: "amber" as const },
    { label: "Up Next", matches: pendingCurrentRound, color: "blue" as const },
    { label: "Recent Results", matches: recentCompleted, color: "emerald" as const },
  ].filter((s) => s.matches.length > 0);

  if (sections.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Swords
            className="mx-auto mb-4 text-[#3D5A3E]"
            style={{ width: "clamp(3rem, 6vw, 5rem)", height: "clamp(3rem, 6vw, 5rem)" }}
          />
          <h3
            className="font-black text-[#3D5A3E]"
            style={{ fontSize: "clamp(1.25rem, 2.5vw, 2rem)" }}
          >
            No Matches Yet
          </h3>
          <p className="mt-2 text-[#3D5A3E]" style={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)" }}>
            Matches will appear here once the tournament begins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-[clamp(1rem,2vh,2rem)]">
      <h2
        className="font-black uppercase tracking-wider text-emerald-400"
        style={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)" }}
      >
        Match Activity — Round {currentRound}
      </h2>

      <div className="flex-1 grid gap-[clamp(1rem,2vw,2rem)]" style={{
        gridTemplateColumns: sections.length === 1
          ? "1fr"
          : sections.length === 2
            ? "1fr 1fr"
            : "1fr 1fr 1fr",
      }}>
        {sections.map((section) => (
          <div key={section.label} className="flex flex-col">
            <div className="flex items-center gap-2 mb-[clamp(0.5rem,1vh,0.75rem)]">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  section.color === "amber" && "bg-amber-500 animate-pulse",
                  section.color === "blue" && "bg-blue-500",
                  section.color === "emerald" && "bg-emerald-500",
                )}
              />
              <h3
                className={cn(
                  "font-bold uppercase tracking-wider",
                  section.color === "amber" && "text-amber-400",
                  section.color === "blue" && "text-blue-400",
                  section.color === "emerald" && "text-emerald-400",
                )}
                style={{ fontSize: "clamp(0.55rem, 0.9vw, 0.75rem)" }}
              >
                {section.label}
              </h3>
              <span
                className="rounded-full bg-white/10 px-2 py-0.5 font-bold text-[#a8c8b4]"
                style={{ fontSize: "clamp(0.45rem, 0.7vw, 0.6rem)" }}
              >
                {section.matches.length}
              </span>
            </div>

            <div className="flex-1 space-y-[clamp(0.4rem,0.8vh,0.6rem)] overflow-y-auto">
              {section.matches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  sectionColor={section.color}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MatchRow                                                           */
/* ------------------------------------------------------------------ */

function MatchRow({
  match,
  sectionColor,
}: {
  match: MatchData;
  sectionColor: "amber" | "blue" | "emerald";
}) {
  const isCompleted = match.status === "completed";
  const isInProgress = match.status === "in_progress";
  const p1Won = isCompleted && match.winner_id === match.player1_id;
  const p2Won = isCompleted && match.winner_id === match.player2_id;

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        isInProgress
          ? "border-amber-500/30 bg-amber-500/5"
          : isCompleted
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-white/10 bg-white/[0.02]",
      )}
    >
      {/* Match header */}
      <div
        className="flex items-center justify-between border-b border-white/5 px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.2rem,0.4vh,0.3rem)]"
      >
        <span
          className="font-bold uppercase tracking-wider text-[#3D5A3E]"
          style={{ fontSize: "clamp(0.4rem, 0.65vw, 0.55rem)" }}
        >
          R{match.round} · M{match.match_number}
        </span>
        {isInProgress && (
          <span className="flex items-center gap-1 text-amber-400" style={{ fontSize: "clamp(0.4rem, 0.65vw, 0.55rem)" }}>
            <Clock style={{ width: "clamp(0.5rem, 0.6vw, 0.6rem)", height: "clamp(0.5rem, 0.6vw, 0.6rem)" }} />
            <span className="font-bold">LIVE</span>
          </span>
        )}
        {isCompleted && match.score && (
          <span
            className="font-medium text-[#a8c8b4] tabular-nums"
            style={{ fontSize: "clamp(0.4rem, 0.65vw, 0.55rem)" }}
          >
            {match.score}
          </span>
        )}
      </div>

      {/* Players */}
      <div className="px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.3rem,0.5vh,0.4rem)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[clamp(0.25rem,0.5vw,0.4rem)] min-w-0 flex-1">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span
              className={cn(
                "truncate font-medium",
                p1Won ? "text-emerald-400" : "text-white",
              )}
              style={{ fontSize: "clamp(0.55rem, 0.9vw, 0.8rem)" }}
            >
              {match.player1?.display_name ?? "TBD"}
            </span>
          </div>
          {p1Won && (
            <CheckCircle2
              className="shrink-0 text-emerald-400"
              style={{ width: "clamp(0.6rem, 0.8vw, 0.75rem)", height: "clamp(0.6rem, 0.8vw, 0.75rem)" }}
            />
          )}
        </div>

        <div className="flex items-center justify-between mt-[clamp(0.15rem,0.3vh,0.25rem)]">
          <div className="flex items-center gap-[clamp(0.25rem,0.5vw,0.4rem)] min-w-0 flex-1">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            <span
              className={cn(
                "truncate font-medium",
                p2Won ? "text-emerald-400" : "text-white",
              )}
              style={{ fontSize: "clamp(0.55rem, 0.9vw, 0.8rem)" }}
            >
              {match.player2?.display_name ?? "TBD"}
            </span>
          </div>
          {p2Won && (
            <CheckCircle2
              className="shrink-0 text-emerald-400"
              style={{ width: "clamp(0.6rem, 0.8vw, 0.75rem)", height: "clamp(0.6rem, 0.8vw, 0.75rem)" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
