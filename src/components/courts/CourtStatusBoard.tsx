"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CourtCard } from "./CourtCard";
import { WaitlistBoard } from "@/components/waitlist/WaitlistBoard";

interface MatchPlayer {
  player_id: string;
  team: number | null;
  players: { display_name: string; avatar_url: string | null };
}

interface CourtWithMatch {
  id: string;
  name: string;
  sport: string;
  is_available: boolean;
  venue_id: string;
}

interface ActiveMatch {
  id: string;
  court_id: string | null;
  sport: string;
  status: "queued" | "playing" | "completed" | "cancelled" | "abandoned" | "disputed";
  started_at: string | null;
  match_players: MatchPlayer[];
}

export function CourtStatusBoard({ venueId }: { venueId?: string }) {
  const [courts, setCourts] = useState<CourtWithMatch[]>([]);
  const [matches, setMatches] = useState<ActiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const supabase = createClient();

    let courtsQuery = supabase.from("courts").select("*").order("name");
    let matchesQuery = supabase
      .from("matches")
      .select(
        "*, match_players(player_id, team, players(display_name, avatar_url))",
      )
      .in("status", ["queued", "playing"])
      .order("created_at", { ascending: true });

    if (venueId) {
      courtsQuery = courtsQuery.eq("venue_id", venueId);
      matchesQuery = matchesQuery.eq("venue_id", venueId);
    }

    const [courtsRes, matchesRes] = await Promise.all([
      courtsQuery,
      matchesQuery,
    ]);

    if (courtsRes.data) setCourts(courtsRes.data);
    if (matchesRes.data) setMatches(matchesRes.data as ActiveMatch[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const supabase = createClient();

    const courtsChannel = supabase
      .channel("courts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courts" },
        () => fetchData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => fetchData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "court_waitlist" },
        () => fetchData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(courtsChannel);
    };
  }, [venueId]);

  const handleComplete = async (matchId: string) => {
    const res = await fetch("/api/matches/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId }),
    });
    if (res.ok) fetchData();
  };

  const handleAssign = async (courtId: string) => {
    const court = courts.find((c) => c.id === courtId);
    if (!court) return;

    const queuedMatch = matches.find(
      (m) => m.status === "queued" && m.sport === court.sport && !m.court_id,
    );
    if (!queuedMatch) return;

    const res = await fetch("/api/matches/assign-court", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: queuedMatch.id, courtId }),
    });
    if (res.ok) fetchData();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl border border-[#0A2E12]/10 bg-white"
          />
        ))}
      </div>
    );
  }

  const sportGroups = courts.reduce<
    Record<string, { total: number; occupied: number }>
  >((acc, court) => {
    if (!acc[court.sport]) acc[court.sport] = { total: 0, occupied: 0 };
    acc[court.sport].total++;
    if (!court.is_available) acc[court.sport].occupied++;
    return acc;
  }, {});

  const allFullSports = Object.entries(sportGroups)
    .filter(([, { total, occupied }]) => total > 0 && occupied >= total)
    .map(([sport]) => sport);

  const effectiveVenueId = venueId ?? courts[0]?.venue_id;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {courts.map((court) => {
          const activeMatch = matches.find(
            (m) => m.court_id === court.id && m.status === "playing",
          );
          const queuedMatch = matches.find(
            (m) =>
              m.status === "queued" && m.sport === court.sport && !m.court_id,
          );

          return (
            <CourtCard
              key={court.id}
              court={court}
              activeMatch={activeMatch}
              queuedMatch={queuedMatch}
              onAssign={handleAssign}
              onComplete={handleComplete}
              durationMinutes={undefined}
            />
          );
        })}
      </div>

      {effectiveVenueId && allFullSports.length > 0 && (
        <div className="space-y-3">
          {allFullSports.map((sport) => (
            <WaitlistBoard
              key={sport}
              venueId={effectiveVenueId}
              sport={sport}
            />
          ))}
        </div>
      )}
    </div>
  );
}
