"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { CreateBowlsTournamentModal } from "@/components/bowls/CreateBowlsTournamentModal";
import { ClubScopeToggle } from "@/components/clubs/ClubScopeToggle";
import { CircleDot } from "lucide-react";
import { BOWLS_FORMAT_LABELS } from "@/lib/types";
import type { BowlsGameFormat } from "@/lib/types";

interface BowlsTournament {
  id: string;
  name: string;
  sport: string;
  format: string;
  status: string;
  max_players: number;
  club_id: string | null;
  starts_at: string | null;
  created_at: string;
  creator?: { display_name: string } | null;
  checkin_count?: number;
}

export default function BowlsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<BowlsTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [scope, setScope] = useState<"club" | "all">("club");
  const [homeClubId, setHomeClubId] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string>("");

  useEffect(() => {
    async function loadPlayer() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?returnTo=/bowls");
        return;
      }
      const { data: player } = await supabase
        .from("players")
        .select("home_club_id")
        .eq("user_id", user.id)
        .single();
      if (player?.home_club_id) {
        setHomeClubId(player.home_club_id);
        const { data: club } = await supabase
          .from("clubs")
          .select("name")
          .eq("id", player.home_club_id)
          .single();
        if (club) setClubName(club.name);
      } else {
        setScope("all");
      }
    }
    loadPlayer();
  }, []);

  const loadTournaments = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from("tournaments")
      .select("*, creator:players!tournaments_created_by_fkey(display_name)")
      .eq("sport", "lawn_bowling")
      .order("created_at", { ascending: false });

    if (scope === "club" && homeClubId) {
      query = query.eq("club_id", homeClubId);
    }

    const { data } = await query;

    if (data) {
      const enriched = await Promise.all(
        data.map(async (t) => {
          const { count } = await supabase
            .from("bowls_checkins")
            .select("id", { count: "exact", head: true })
            .eq("tournament_id", t.id);
          return { ...t, checkin_count: count ?? 0 } as BowlsTournament;
        })
      );
      setTournaments(enriched);
    }
    setLoading(false);
  }, [scope, homeClubId]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const activeTournaments = tournaments.filter((t) => t.status !== "completed");
  const pastTournaments = tournaments.filter((t) => t.status === "completed");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FEFCF9]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B5E20] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1
                className="text-xl font-bold tracking-tight text-[#0A2E12] sm:text-2xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Lawn Bowls
              </h1>
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/bowls/about" className="text-sm text-[#1B5E20] hover:text-[#145218] py-1 min-h-[44px] flex items-center">
                  About
                </Link>
                <span className="text-[#3D5A3E]/40">|</span>
                <Link href="/bowls/history" className="text-sm text-[#1B5E20] hover:text-[#145218] py-1 min-h-[44px] flex items-center">
                  History
                </Link>
                <span className="text-[#3D5A3E]/40">|</span>
                <Link href="/bowls/stats" className="text-sm text-[#1B5E20] hover:text-[#145218] py-1 min-h-[44px] flex items-center">
                  Stats
                </Link>
                <span className="text-[#3D5A3E]/40">|</span>
                <Link href="/pennant" className="text-sm text-[#1B5E20] hover:text-[#145218] py-1 min-h-[44px] flex items-center">
                  Pennant
                </Link>
              </div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              data-onboarding-target="create-tournament"
              className="shrink-0 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#145218] min-h-[44px] touch-manipulation"
            >
              <span className="hidden sm:inline">+ New Tournament</span>
              <span className="sm:hidden">+ New</span>
            </button>
          </div>
          {homeClubId && (
            <div className="mt-3">
              <ClubScopeToggle
                scope={scope}
                onScopeChange={setScope}
                clubName={clubName}
              />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {activeTournaments.length > 0 && (
          <section className="mb-8">
            <h2
              className="mb-3 text-sm font-bold uppercase tracking-wider text-[#3D5A3E]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Active Tournaments
            </h2>
            <div className="space-y-3">
              {activeTournaments.map((t, i) => (
                <TournamentCard key={t.id} tournament={t} index={i} />
              ))}
            </div>
          </section>
        )}

        {pastTournaments.length > 0 && (
          <section className="mb-8">
            <h2
              className="mb-3 text-sm font-bold uppercase tracking-wider text-[#3D5A3E]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Past Tournaments
            </h2>
            <div className="space-y-3">
              {pastTournaments.map((t, i) => (
                <TournamentCard key={t.id} tournament={t} index={i} />
              ))}
            </div>
          </section>
        )}

        {tournaments.length === 0 && (
          <div className="rounded-2xl bg-white border border-[#0A2E12]/10 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20]/10">
              <CircleDot className="w-8 h-8 text-[#1B5E20]" strokeWidth={1.5} />
            </div>
            <h3
              className="text-lg font-bold text-[#0A2E12]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {scope === "club" ? "No club tournaments yet" : "No bowls tournaments yet"}
            </h3>
            <p className="mt-1 text-sm text-[#3D5A3E]">
              {scope === "club"
                ? "Create a tournament for your club or switch to All Clubs"
                : "Create your first lawn bowling tournament to get started"}
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#145218] min-h-[44px] touch-manipulation"
            >
              Create Tournament
            </button>
          </div>
        )}
      </main>

      <CreateBowlsTournamentModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={loadTournaments}
      />

      <BottomNav />
    </div>
  );
}

function TournamentCard({ tournament: t, index }: { tournament: BowlsTournament; index: number }) {
  const formatLabel = BOWLS_FORMAT_LABELS[t.format as BowlsGameFormat]?.label ?? t.format;
  const isActive = t.status !== "completed";
  const isLive = t.status === "in_progress";

  const dateStr = t.starts_at
    ? new Date(t.starts_at).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link href={`/bowls/${t.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="rounded-2xl bg-white border border-[#0A2E12]/10 p-5 sm:p-6 transition-all hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {dateStr && (
                <span className="rounded-full bg-[#B8860B]/10 px-2.5 py-1 text-xs font-bold text-[#B8860B]">
                  {dateStr}
                </span>
              )}
              <span className="rounded-full bg-[#0A2E12]/5 px-2.5 py-1 text-xs font-bold text-[#3D5A3E]">
                {formatLabel}
              </span>
            </div>
            <h3
              className="text-base font-bold text-[#0A2E12] truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.name}
            </h3>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-3">
            <div className="text-right">
              <p className="text-lg font-bold text-[#B8860B] tabular-nums">
                {t.checkin_count ?? 0}
              </p>
              <p className="text-xs text-[#3D5A3E]">checked in</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-sm font-bold ${
                isLive
                  ? "bg-red-100 text-red-700"
                  : isActive
                    ? "bg-[#1B5E20]/10 text-[#1B5E20]"
                    : "bg-[#0A2E12]/5 text-[#3D5A3E]"
              }`}
            >
              {isLive ? "LIVE" : isActive ? "UPCOMING" : "COMPLETED"}
            </span>
          </div>
        </div>
        {t.creator?.display_name && (
          <p className="mt-2 text-xs text-[#3D5A3E]">
            Created by {t.creator.display_name}
          </p>
        )}
      </motion.div>
    </Link>
  );
}
