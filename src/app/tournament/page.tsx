"use client";

import { BottomNav } from "@/components/board/BottomNav";
import { TournamentList } from "@/components/tournament/TournamentList";

export default function TournamentPage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-xl font-bold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>Tournaments</h1>
          <p className="text-sm text-[#3D5A3E]">Compete in organized brackets and round robins</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <TournamentList />
      </div>

      <BottomNav />
    </div>
  );
}
