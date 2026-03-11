"use client";

import { BottomNav } from "@/components/board/BottomNav";
import { TeamList } from "@/components/teams/TeamList";

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#1a3d28]/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">My Teams</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Create or join teams to play together</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <TeamList />
      </div>

      <BottomNav />
    </div>
  );
}
