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
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Calendar,
  Shield,
  CircleDot,
  Users,
  Bell,
  User,
  LogOut,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";
import type { SkillLevel, Player } from "@/lib/types";

const QUICK_LINKS = [
  {
    href: "/tournament",
    label: "Tournaments",
    description: "Compete & win",
    icon: Trophy,
    color: "from-emerald-500 to-green-700",
    bg: "bg-emerald-50 hover:bg-emerald-100",
  },
  {
    href: "/schedule",
    label: "Events",
    description: "Upcoming games",
    icon: Calendar,
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 hover:bg-amber-100",
  },
  {
    href: "/pennant",
    label: "Pennant",
    description: "Team competition",
    icon: Shield,
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50 hover:bg-sky-100",
  },
  {
    href: "/bowls",
    label: "My Bowls",
    description: "Equipment & stats",
    icon: CircleDot,
    color: "from-rose-400 to-pink-600",
    bg: "bg-rose-50 hover:bg-rose-100",
  },
  {
    href: "/clubs",
    label: "Clubs",
    description: "Find your club",
    icon: Users,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 hover:bg-violet-100",
  },
];

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

  const displayName = currentPlayer?.display_name?.split(" ")[0] || "Player";

  return (
    <IncomingRequestProvider>
      <div className="min-h-screen pb-20 lg:pb-0" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fefcf9 40%, #fef9ee 100%)" }}>
        {/* Header */}
        <header className="sticky top-0 z-40 border-b" style={{ backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderColor: "rgba(10,46,18,0.08)" }}>
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 lg:px-8">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo/bowls-icon.png"
                alt="Lawnbowling"
                width={36}
                height={36}
                className="rounded-full shadow-sm"
              />
              <div>
                <h1
                  className="text-xl font-bold lg:text-2xl"
                  style={{ color: "#0A2E12", fontFamily: "var(--font-display)" }}
                >
                  Lawnbowling
                </h1>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" style={{ color: "#3D5A3E" }} />
                  <span className="text-xs" style={{ color: "#3D5A3E" }}>{venue?.name ?? "Select venue"}</span>
                  <VenueSelector
                    venues={venues}
                    selectedVenueId={selectedVenueId}
                    onSelect={selectVenue}
                    compact
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <NotificationCenter playerId={currentPlayer?.id ?? null} />
              <Link
                href="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#0A2E12]/5"
              >
                <User className="h-5 w-5" style={{ color: "#3D5A3E" }} />
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 lg:px-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-1"
          >
            <h2
              className="text-2xl font-bold lg:text-3xl"
              style={{ color: "#0A2E12", fontFamily: "var(--font-display)" }}
            >
              Welcome back, {displayName}!
            </h2>
            <p className="text-base" style={{ color: "#3D5A3E" }}>
              Ready for a game today?
            </p>
          </motion.div>

          {/* Check-In Button */}
          {!loadingPlayer && currentPlayer && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-6"
            >
              <CheckInButton
                playerId={currentPlayer.id}
                isAvailable={currentPlayer.is_available}
                venueId={venue?.id ?? null}
                onToggle={handleCheckInToggle}
              />
            </motion.div>
          )}

          {/* Quick Links Grid */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {QUICK_LINKS.map((link, i) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className={`cursor-pointer rounded-2xl border-0 p-5 text-center shadow-sm transition-all ${link.bg}`}
                    >
                      <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${link.color} shadow-md`}>
                        <Icon className="h-7 w-7 text-white" strokeWidth={1.8} />
                      </div>
                      <h3 className="text-sm font-semibold" style={{ color: "#0A2E12" }}>{link.label}</h3>
                      <p className="mt-0.5 text-xs" style={{ color: "#3D5A3E" }}>{link.description}</p>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 grid grid-cols-3 gap-3"
          >
            <div className="rounded-2xl bg-white/80 p-4 text-center shadow-sm" style={{ backdropFilter: "blur(8px)" }}>
              <div className="text-2xl font-bold" style={{ color: "#1B5E20" }}>
                <LiveIndicator count={players.length} inline />
              </div>
              <div className="mt-1 text-xs font-medium" style={{ color: "#3D5A3E" }}>Players Online</div>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 text-center shadow-sm" style={{ backdropFilter: "blur(8px)" }}>
              <div className="text-2xl font-bold" style={{ color: "#1B5E20" }}>
                {pendingSent.length}
              </div>
              <div className="mt-1 text-xs font-medium" style={{ color: "#3D5A3E" }}>Pending Requests</div>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 text-center shadow-sm" style={{ backdropFilter: "blur(8px)" }}>
              <div className="text-2xl font-bold" style={{ color: "#1B5E20" }}>
                {venues.length}
              </div>
              <div className="mt-1 text-xs font-medium" style={{ color: "#3D5A3E" }}>Venues</div>
            </div>
          </motion.div>

          {/* Suggested Partners */}
          {currentPlayer?.is_available && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <SuggestedPartners
                currentPlayerId={currentPlayer.id}
                sportFilter={null}
                onPickMe={handlePickMe}
                pendingTargetIds={pendingTargetIds}
              />
            </motion.div>
          )}

          {/* Available Players Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3
                className="text-lg font-bold"
                style={{ color: "#0A2E12", fontFamily: "var(--font-display)" }}
              >
                Available Players ({players.length})
              </h3>
              <BoardFilters
                selectedSkill={skillFilter}
                onSkillChange={setSkillFilter}
              />
            </div>

            <AvailabilityBoard
              players={players}
              loading={loading}
              onPickMe={handlePickMe}
              pendingTargetIds={pendingTargetIds}
            />
          </motion.div>

          {/* Sidebar Content (desktop) */}
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-white/80 p-5 shadow-sm"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <h3
                className="mb-3 text-base font-bold"
                style={{ color: "#0A2E12", fontFamily: "var(--font-display)" }}
              >
                Match Queue
              </h3>
              <MatchQueue />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl bg-white/80 p-5 shadow-sm"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <h3
                className="mb-3 text-base font-bold"
                style={{ color: "#0A2E12", fontFamily: "var(--font-display)" }}
              >
                Court Status
              </h3>
              <CourtStatusBoard />
            </motion.div>
          </div>
        </main>

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
