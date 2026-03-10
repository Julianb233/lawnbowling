"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimePlayers } from "@/lib/hooks/useRealtimePlayers";
import { AvailabilityBoard } from "@/components/board/AvailabilityBoard";
import { BoardFilters } from "@/components/board/BoardFilters";
import { CheckInButton } from "@/components/board/CheckInButton";
import { LiveIndicator } from "@/components/board/LiveIndicator";
import { BottomNav } from "@/components/board/BottomNav";
import type { Sport, SkillLevel, Player } from "@/lib/types";

export default function BoardPage() {
  const [sportFilter, setSportFilter] = useState<Sport | null>(null);
  const [skillFilter, setSkillFilter] = useState<SkillLevel | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState(true);

  const { players, loading } = useRealtimePlayers({
    sportFilter,
    skillFilter,
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadCurrentPlayer() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("players")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setCurrentPlayer(data as Player);
        }
      }
      setLoadingPlayer(false);
    }

    loadCurrentPlayer();
  }, [supabase]);

  function handlePickMe(player: Player) {
    // Phase 4 will implement the partner request modal
    console.log("Pick me clicked for:", player.name);
  }

  function handleCheckInToggle(newState: boolean) {
    if (currentPlayer) {
      setCurrentPlayer({
        ...currentPlayer,
        is_available: newState,
        checked_in_at: newState ? new Date().toISOString() : null,
      });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 lg:text-2xl">
              {"\u{1F3D3}"} Pick a Partner
            </h1>
            <p className="text-sm text-zinc-500">Sunset Rec Center</p>
          </div>
          <LiveIndicator count={players.length} />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
        {/* Check-in button for authenticated player */}
        {!loadingPlayer && currentPlayer && (
          <div className="mb-4">
            <CheckInButton
              playerId={currentPlayer.id}
              isAvailable={currentPlayer.is_available}
              onToggle={handleCheckInToggle}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-4">
          <BoardFilters
            selectedSport={sportFilter}
            selectedSkill={skillFilter}
            onSportChange={setSportFilter}
            onSkillChange={setSkillFilter}
          />
        </div>

        {/* Main content: Board + Queue sidebar */}
        <div className="flex gap-6">
          {/* Board (main) */}
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Available Players ({players.length})
              </h2>
            </div>
            <AvailabilityBoard
              players={players}
              loading={loading}
              onPickMe={handlePickMe}
            />
          </div>

          {/* Queue sidebar (iPad only) */}
          <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Ready to Play
              </h2>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-3xl">{"\u{1F4CB}"}</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Queue will appear here
                </p>
                <p className="mt-1 text-xs text-zinc-300">Coming in Phase 4</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Courts Status
              </h2>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-3xl">{"\u{1F3DF}\uFE0F"}</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Court status will appear here
                </p>
                <p className="mt-1 text-xs text-zinc-300">Coming in Phase 5</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Tip banner */}
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
          {"\u{1F4A1}"} Tap a player card to send a partner request. They&apos;ll get a ping!
        </div>
      </div>

      {/* Bottom navigation (mobile only) */}
      <BottomNav />
    </div>
  );
}
