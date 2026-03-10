"use client";

import { BottomNav } from "@/components/board/BottomNav";
import { TournamentList } from "@/components/tournament/TournamentList";

export default function TournamentPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-xl font-bold text-zinc-100">Tournaments</h1>
          <p className="text-sm text-zinc-500">Compete in organized brackets and round robins</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <TournamentList />
      </div>

      <BottomNav />
    </div>
  );
}
