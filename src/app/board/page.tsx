"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRealtimePlayers } from "@/lib/hooks/useRealtimePlayers";
import { usePartnerRequests } from "@/lib/hooks/usePartnerRequests";
import { useSentRequests, type SentRequestUpdate } from "@/lib/hooks/useSentRequests";
import { useVenues } from "@/lib/hooks/useVenues";
import { AvailabilityBoard } from "@/components/board/AvailabilityBoard";
import { BoardFilters } from "@/components/board/BoardFilters";
import { CheckInButton } from "@/components/board/CheckInButton";
import { LiveIndicator } from "@/components/board/LiveIndicator";
import { BottomNav } from "@/components/board/BottomNav";
import { RequestModal } from "@/components/partner/RequestModal";
import { IncomingRequest, IncomingRequestProvider } from "@/components/partner/IncomingRequest";
import { SentRequestToast } from "@/components/partner/SentRequestToast";
import { MatchQueue } from "@/components/partner/MatchQueue";
import { CourtStatusBoard } from "@/components/courts/CourtStatusBoard";
import { SuggestedPartners } from "@/components/board/SuggestedPartners";
import { VenueSelector } from "@/components/venue/VenueSelector";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { CircleDot, Lightbulb } from "lucide-react";
import type { SkillLevel, Player } from "@/lib/types";

export default function BoardPage() {
  const [skillFilter, setSkillFilter] = useState<SkillLevel | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState(true);
  const [requestTarget, setRequestTarget] = useState<Player | null>(null);
  const { venues, selectedVenue: venue, selectedVenueId, selectVenue } = useVenues();
  const [statusNotifications, setStatusNotifications] = useState<
    Array<{ id: string; targetName: string; sport: string; status: "accepted" | "declined" | "expired" }>
  >([]);

  const { players, loading } = useRealtimePlayers({
    sportFilter: null,
    skillFilter,
    venueId: venue?.id ?? null,
  });

  const supabase = createClient();

  const { requests: incomingRequests, refetch: refetchRequests } = usePartnerRequests(
    currentPlayer?.id ?? null
  );

  const handleSentRequestUpdate = useCallback((update: SentRequestUpdate) => {
    setStatusNotifications((prev) => [
      ...prev,
      {
        id: update.id,
        targetName: update.targetName || "Player",
        sport: update.sport || "lawn_bowling",
        status: update.status,
      },
    ]);
  }, []);

  const { pendingSent, refetch: refetchSent } = useSentRequests(currentPlayer?.id ?? null, handleSentRequestUpdate);

  const pendingTargetIds = useMemo(
    () => new Set(pendingSent.map((r) => r.target_id)),
    [pendingSent]
  );

  useEffect(() => {
    async function loadCurrentPlayer() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("players")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setCurrentPlayer(data as Player);
        }
      }
      setLoadingPlayer(false);
    }

    loadCurrentPlayer();
  }, [supabase]);

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
        <header className="sticky top-0 z-40 glass border-b border-zinc-200 dark:border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-xl font-black text-zinc-900 dark:text-foreground lg:text-2xl flex items-center gap-2">
                <CircleDot className="w-5 h-5 text-[#1B5E20]" strokeWidth={1.5} />
                <span className="text-gradient">Lawnbowling</span>
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-zinc-500 dark:text-muted-foreground">{venue?.name ?? "Loading venue..."}</p>
                <VenueSelector
                  venues={venues}
                  selectedVenueId={selectedVenueId}
                  onSelect={selectVenue}
                  compact
                />
              </div>
            </motion.div>
            <div className="flex items-center gap-2">
              <NotificationCenter playerId={currentPlayer?.id ?? null} />
              <LiveIndicator count={players.length} />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
          {!loadingPlayer && currentPlayer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <CheckInButton
                playerId={currentPlayer.id}
                isAvailable={currentPlayer.is_available}
                venueId={venue?.id ?? null}
                onToggle={handleCheckInToggle}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <BoardFilters
              selectedSkill={skillFilter}
              onSkillChange={setSkillFilter}
            />
          </motion.div>

          {currentPlayer?.is_available && (
            <SuggestedPartners
              currentPlayerId={currentPlayer.id}
              sportFilter={null}
              onPickMe={handlePickMe}
              pendingTargetIds={pendingTargetIds}
            />
          )}

          <div className="flex gap-6">
            <div className="min-w-0 flex-1">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mb-3 flex items-center justify-between"
              >
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
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
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Courts Status
                </h2>
                <CourtStatusBoard />
              </motion.div>
            </aside>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 rounded-2xl glass border-amber-200 dark:border-amber-800/30 px-4 py-3 text-center text-sm text-amber-700 dark:text-amber-300"
          >
            <Lightbulb className="w-4 h-4 inline-block mr-1 -mt-0.5" strokeWidth={1.5} />
            Tap a player card to send a partner request. They&apos;ll get a ping!
          </motion.div>
        </div>

        <BottomNav />

        {requestTarget && currentPlayer && (
          <RequestModal
            target={requestTarget}
            open={!!requestTarget}
            onOpenChange={(open) => !open && setRequestTarget(null)}
            onSubmit={handleSendRequest}
          />
        )}

        {incomingRequests.map((req) => (
          <IncomingRequest
            key={req.id}
            request={req}
            onRespond={handleRespondToRequest}
          />
        ))}

        {statusNotifications.map((notif) => (
          <SentRequestToast
            key={notif.id}
            targetName={notif.targetName}
            sport={notif.sport}
            status={notif.status}
            onDismiss={() =>
              setStatusNotifications((prev) => prev.filter((n) => n.id !== notif.id))
            }
          />
        ))}
      </div>
    </IncomingRequestProvider>
  );
}
