"use client";

import { DivisionLadder } from "@/components/pennant/DivisionLadder";
import type { PennantStanding } from "@/lib/pennant-engine";

interface PennantLadderSlideProps {
  standings: PennantStanding[];
  divisionName?: string;
  seasonName?: string;
}

export default function PennantLadderSlide({
  standings,
  divisionName,
  seasonName,
}: PennantLadderSlideProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          Season Ladder
        </p>
        {seasonName && (
          <h2
            className="mt-1 font-black text-white"
            style={{ fontSize: "clamp(1.25rem, 2.5vw, 2rem)" }}
          >
            {seasonName}
          </h2>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <DivisionLadder
          standings={standings}
          tvMode
          divisionName={divisionName}
        />
      </div>
    </div>
  );
}
