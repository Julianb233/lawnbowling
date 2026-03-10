"use client";

import { BottomNav } from "@/components/board/BottomNav";
import { TeamList } from "@/components/teams/TeamList";

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-xl font-bold text-zinc-100">My Teams</h1>
          <p className="text-sm text-zinc-500">Create or join teams to play together</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <TeamList />
      </div>

      <BottomNav />
    </div>
  );
}
