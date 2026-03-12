"use client";

import { cn } from "@/lib/utils";
import type { TournamentScore } from "@/lib/types";

interface LiveScoresSlideProps {
  scores: TournamentScore[];
  currentRound: number;
  pageIndex?: number;
  rinksPerPage?: number;
}

export default function LiveScoresSlide({
  scores,
  currentRound,
  pageIndex = 0,
  rinksPerPage = 6,
}: LiveScoresSlideProps) {
  const roundScores = scores.filter((s) => s.round === currentRound);
  const start = pageIndex * rinksPerPage;
  const pageScores = roundScores.slice(start, start + rinksPerPage);

  if (pageScores.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-[#3D5A3E]">
            Round {currentRound}
          </h3>
          <p className="mt-2 text-[clamp(1rem,2vw,1.25rem)] text-[#3D5A3E]">
            Waiting for scores...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-[clamp(1rem,2vw,2rem)]">
      <div className="mb-[clamp(0.5rem,1vh,1rem)] flex items-center justify-between">
        <h2 className="text-[clamp(1rem,2vw,1.5rem)] font-black uppercase tracking-wider text-[#3D5A3E]">
          Live Scores &mdash; Round {currentRound}
        </h2>
        {roundScores.length > rinksPerPage && (
          <span className="text-[clamp(0.75rem,1.2vw,1rem)] text-[#3D5A3E]">
            Page {pageIndex + 1} of {Math.ceil(roundScores.length / rinksPerPage)}
          </span>
        )}
      </div>
      <div className="grid flex-1 gap-[clamp(0.75rem,1.5vw,1.5rem)] md:grid-cols-2 xl:grid-cols-3">
        {pageScores.map((score) => (
          <ScoreCard key={score.id} score={score} />
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ score }: { score: TournamentScore }) {
  const isFinalized = score.is_finalized;
  const hasScores = score.team_a_scores.length > 0 || score.team_b_scores.length > 0;
  const teamAWinning = score.total_a > score.total_b;
  const teamBWinning = score.total_b > score.total_a;
  const isDraw = hasScores && score.total_a === score.total_b;

  return (
    <div className={cn(
      "rounded-2xl border bg-[#0A2E12] overflow-hidden",
      isFinalized ? "border-emerald-500/30" : hasScores ? "border-amber-500/30" : "border-white/10"
    )}>
      <div className="flex items-center justify-between border-b border-white/5 bg-[#0A2E12]/50 px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.4rem,0.8vh,0.75rem)]">
        <h3 className="text-[clamp(0.65rem,1vw,0.875rem)] font-bold uppercase tracking-wider text-[#3D5A3E]">
          Rink {score.rink}
        </h3>
        {isFinalized ? (
          <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[clamp(0.6rem,0.9vw,0.75rem)] font-bold text-emerald-400">Final</span>
        ) : hasScores ? (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-[clamp(0.6rem,0.9vw,0.75rem)] font-bold text-amber-400">
            <span className="live-dot" style={{ width: 6, height: 6 }} />
            In Play
          </span>
        ) : (
          <span className="rounded-full bg-[#0A2E12] px-3 py-0.5 text-[clamp(0.6rem,0.9vw,0.75rem)] font-bold text-[#3D5A3E]">Pending</span>
        )}
      </div>
      <div className="p-[clamp(0.75rem,1.5vw,1.25rem)]">
        <TeamRow label="Team A" players={score.team_a_players} total={score.total_a} endsWon={score.ends_won_a} winning={teamAWinning} color="emerald" />
        <div className="my-[clamp(0.3rem,0.5vh,0.5rem)] flex items-center gap-2">
          <div className="flex-1 border-t border-white/5" />
          <span className="text-[clamp(0.5rem,0.8vw,0.65rem)] font-bold text-[#3D5A3E]">VS</span>
          <div className="flex-1 border-t border-white/5" />
        </div>
        <TeamRow label="Team B" players={score.team_b_players} total={score.total_b} endsWon={score.ends_won_b} winning={teamBWinning} color="blue" />
        {isFinalized && (
          <div className="mt-2 text-center">
            {isDraw ? (
              <span className="text-[clamp(0.6rem,1vw,0.875rem)] font-bold text-[#3D5A3E]">Draw</span>
            ) : teamAWinning ? (
              <span className="text-[clamp(0.6rem,1vw,0.875rem)] font-bold text-emerald-400">Team A wins by {score.total_a - score.total_b}</span>
            ) : (
              <span className="text-[clamp(0.6rem,1vw,0.875rem)] font-bold text-blue-400">Team B wins by {score.total_b - score.total_a}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TeamRow({ label, players, total, endsWon, winning, color }: {
  label: string;
  players: { player_id: string; display_name: string }[];
  total: number;
  endsWon: number;
  winning: boolean;
  color: "emerald" | "blue";
}) {
  const bgClass = winning ? (color === "emerald" ? "bg-emerald-500/10" : "bg-blue-500/10") : "bg-[#0A2E12]/30";
  const colorClass = color === "emerald" ? "text-emerald-400" : "text-blue-400";

  return (
    <div className={cn("flex items-center justify-between rounded-xl p-[clamp(0.5rem,1vw,1rem)]", bgClass)}>
      <div className="flex-1 min-w-0">
        <p className={cn("text-[clamp(0.5rem,0.8vw,0.65rem)] font-bold uppercase tracking-wider mb-0.5", colorClass)}>{label}</p>
        <div className="space-y-0.5">
          {players?.map((p) => (
            <p key={p.player_id} className="text-[clamp(0.6rem,1vw,0.875rem)] font-medium text-white truncate">{p.display_name}</p>
          ))}
          {(!players || players.length === 0) && <p className="text-[clamp(0.6rem,1vw,0.875rem)] text-[#3D5A3E]">--</p>}
        </div>
      </div>
      <div className="ml-4 text-right">
        <p className={cn("text-[clamp(2rem,4vw,3.5rem)] font-black tabular-nums", winning ? colorClass : "text-white")}>{total}</p>
        <p className="text-[clamp(0.5rem,0.8vw,0.65rem)] text-[#3D5A3E]">{endsWon} ends</p>
      </div>
    </div>
  );
}
