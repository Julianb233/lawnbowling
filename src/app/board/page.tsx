"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRealtimePlayers } from "@/lib/hooks/useRealtimePlayers";
import { usePartnerRequests } from "@/lib/hooks/usePartnerRequests";
import { useSentRequests, type SentRequestUpdate } from "@/lib/hooks/useSentRequests";
import { AvailabilityBoard } from "@/components/board/AvailabilityBoard";
import { BoardFilters } from "@/components/board/BoardFilters";
import { CheckInButton } from "@/components/board/CheckInButton";
import { LiveIndicator } from "@/components/board/LiveIndicator";
import { BottomNav } from "@/components/board/BottomNav";
import { RequestModal } from "@/components/partner/RequestModal";
import { IncomingRequest, IncomingRequestProvider } from "@/components/partner/IncomingRequest";
import { MatchQueue } from "@/components/partner/MatchQueue";
import { CourtStatusBoard } from "@/components/courts/CourtStatusBoard";
import type { Sport, SkillLevel, Player } from "@/lib/types";

export default function BoardPage() {
  const [sportFilter, setSportFilter] = useState<Sport | null>(null);
  const [skillFilter, setSkillFilter] = useState<SkillLevel | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState(true);
  const [requestTarget, setRequestTarget] = useState<Player | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  const { players, loading } = useRealtimePlayers({
    sportFilter,
    skillFilter,
  });

  const supabase = createClient();

  const { requests: incomingRequests, refetch: refetchRequests } = usePartnerRequests(
    currentPlayer?.id ?? null
  );

  // Watch for responses to our sent requests (decline/accept/expire notifications)
  const handleSentRequestUpdate = useCallback((update: SentRequestUpdate) => {
    const name = update.targetName || "Player";
    if (update.status === "declined") {
      setToastMessage({ text: `${name} declined your request`, type: "info" });
    } else if (update.status === "accepted") {
      setToastMessage({ text: `${name} accepted! You're matched!`, type: "success" });
    } else if (update.status === "expired") {
      setToastMessage({ text: `Your request to ${name} expired`, type: "info" });
    }
  }, []);

  const { pendingSent, refetch: refetchSent } = useSentRequests(currentPlayer?.id ?? null, handleSentRequestUpdate);

  // Compute set of player IDs with pending outgoing requests for card indicators
  const pendingTargetIds = useMemo(
    () => new Set(pendingSent.map((r) => r.target_id)),
    [pendingSent]
  );

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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

  // Expire stale requests on load
  useEffect(() => {
    fetch("/api/partner/expire").catch(() => {});
  }, []);

  function handlePickMe(player: Player) {
    if (!currentPlayer) return;
    if (player.id === currentPlayer.id) return;
    setRequestTarget(player);
  }

  const handleSendRequest = useCallback(async (targetId: string, sport: string) => {
    const response = await fetch("/api/partner/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_id: targetId, sport }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to send request");
    }

    // Refresh sent requests to update pending indicators on player cards
    refetchSent();
  }, [refetchSent]);

  const handleRespondToRequest = useCallback(async (requestId: string, accept: boolean) => {
    const response = await fetch("/api/partner/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId, accept }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to respond");
    }

    refetchRequests();
  }, [refetchRequests]);

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
    <IncomingRequestProvider>
      <div className="min-h-screen bg-animated-gradient pb-20 lg:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-zinc-700/30">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-xl font-black text-zinc-100 lg:text-2xl">
                {"\u{1F3D3}"} <span className="text-gradient">Pick a Partner</span>
              </h1>
              <p className="text-sm text-zinc-500">Sunset Rec Center</p>
            </motion.div>
            <LiveIndicator count={players.length} />
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
          {/* Check-in button for authenticated player */}
          {!loadingPlayer && currentPlayer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <CheckInButton
                playerId={currentPlayer.id}
                isAvailable={currentPlayer.is_available}
                onToggle={handleCheckInToggle}
              />
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <BoardFilters
              selectedSport={sportFilter}
              selectedSkill={skillFilter}
              onSportChange={setSportFilter}
              onSkillChange={setSkillFilter}
            />
          </motion.div>

          {/* Main content: Board + Queue sidebar */}
          <div className="flex gap-6">
            {/* Board (main) */}
            <div className="min-w-0 flex-1">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mb-3 flex items-center justify-between"
              >
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Available Players ({players.length})
                </h2>
              </motion.div>
              <AvailabilityBoard
                players={players}
                loading={loading}
                onPickMe={handlePickMe}
                pendingTargetIds={pendingTargetIds}
              />
            </div>

            {/* Queue sidebar (iPad only) */}
            <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl glass p-4"
              >
                <MatchQueue />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 rounded-2xl glass p-4"
              >
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                  Courts Status
                </h2>
                <CourtStatusBoard />
              </motion.div>
            </aside>
          </div>

          {/* Tip banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 rounded-2xl glass border-amber-500/20 px-4 py-3 text-center text-sm text-amber-400/80"
          >
            {"\u{1F4A1}"} Tap a player card to send a partner request. They&apos;ll get a ping!
          </motion.div>
        </div>

        {/* Bottom navigation (mobile only) */}
        <BottomNav />

        {/* Partner Request Modal */}
        {requestTarget && currentPlayer && (
          <RequestModal
            target={requestTarget}
            currentPlayerSports={currentPlayer.sports}
            open={!!requestTarget}
            onOpenChange={(open) => !open && setRequestTarget(null)}
            onSubmit={handleSendRequest}
          />
        )}

        {/* Incoming request notifications */}
        {incomingRequests.map((req) => (
          <IncomingRequest
            key={req.id}
            request={req}
            onRespond={handleRespondToRequest}
          />
        ))}

        {/* Toast notifications for sent request responses */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur-md lg:bottom-8 ${
                toastMessage.type === "success"
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30"
                  : toastMessage.type === "error"
                    ? "bg-red-500/20 text-red-300 ring-1 ring-red-500/30"
                    : "bg-zinc-700/80 text-zinc-200 ring-1 ring-zinc-600/30"
              }`}
            >
              {toastMessage.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </IncomingRequestProvider>
  );
}
