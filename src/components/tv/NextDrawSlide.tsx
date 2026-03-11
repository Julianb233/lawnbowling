"use client";

import type { TournamentScore } from "@/lib/types";

interface NextDrawSlideProps {
  scores: TournamentScore[];
  maxRound: number;
}

export default function NextDrawSlide({ scores, maxRound }: NextDrawSlideProps) {
  const nextRoundScores = scores.filter(
    (s) => s.round === maxRound && !s.is_finalized && s.team_a_players?.length > 0
  );

  if (nextRoundScores.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full flex-col px-[clamp(1rem,2vw,2rem)]">
      <h2 className="mb-[clamp(0.5rem,1vh,1rem)] text-[clamp(1rem,2vw,1.5rem)] font-black uppercase tracking-wider text-zinc-400">
        Next Up &mdash; Round {maxRound}
      </h2>
      <div className="grid flex-1 gap-[clamp(0.75rem,1.5vw,1.5rem)] md:grid-cols-2 xl:grid-cols-3">
        {nextRoundScores
          .sort((a, b) => a.rink - b.rink)
          .map((s) => (
            <div key={s.id} className="rounded-2xl border border-white/10 bg-zinc-900 p-[clamp(1rem,2vw,1.5rem)]">
              <p className="mb-[clamp(0.5rem,1vh,0.75rem)] text-center text-[clamp(0.7rem,1vw,0.875rem)] font-bold uppercase tracking-wider text-zinc-400">
                Rink {s.rink}
              </p>
              <div className="grid grid-cols-2 gap-[clamp(0.5rem,1vw,1rem)]">
                <div>
                  <p className="mb-1 text-[clamp(0.55rem,0.8vw,0.7rem)] font-bold uppercase tracking-wider text-emerald-400">Team A</p>
                  {s.team_a_players?.map((p) => (
                    <p key={p.player_id} className="text-[clamp(0.7rem,1.1vw,1rem)] font-medium text-white">{p.display_name}</p>
                  ))}
                </div>
                <div>
                  <p className="mb-1 text-[clamp(0.55rem,0.8vw,0.7rem)] font-bold uppercase tracking-wider text-blue-400">Team B</p>
                  {s.team_b_players?.map((p) => (
                    <p key={p.player_id} className="text-[clamp(0.7rem,1.1vw,1rem)] font-medium text-white">{p.display_name}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
