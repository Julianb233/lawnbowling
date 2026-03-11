"use client";

import { useEffect, useState, useCallback } from "react";
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
  status: "queued" | "playing" | "completed";
  started_at: string | null;
  match_players: MatchPlayer[];
}

export function CourtStatusBoard() {
  const [courts, setCourts] = useState<CourtWithMatch[]>([]);
  const [matches, setMatches] = useState<ActiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const [courtsRes, matchesRes] = await Promise.all([
      supabase.from("courts").select("*").order("name"),
      supabase
        .from("matches")
        .select(
          "*, match_players(player_id, team, players(display_name, avatar_url))",
        )
        .in("status", ["queued", "playing"])
        .order("created_at", { ascending: true }),
    ]);

    if (courtsRes.data) setCourts(courtsRes.data);
    if (matchesRes.data) setMatches(matchesRes.data as ActiveMatch[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    const supabase = createClient();

    const channel = supabase
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
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

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
            className="h-40 animate-pulse rounded-xl border border-zinc-200 bg-white"
          />
        ))}
      </div>
    );
  }

  const sportCourts = new Map<
    string,
    { total: number; busy: number; venueId: string }
  >();
  for (const court of courts) {
    const entry = sportCourts.get(court.sport) ?? {
      total: 0,
      busy: 0,
      venueId: court.venue_id,
    };
    entry.total++;
    if (!court.is_available) entry.busy++;
    sportCourts.set(court.sport, entry);
  }

  const fullSports = Array.from(sportCourts.entries())
    .filter(([, info]) => info.total > 0 && info.busy >= info.total)
    .map(([sport, info]) => ({ sport, venueId: info.venueId }));

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
              durationMinutes={court.sport === "pickleball" ? 20 : undefined}
            />
          );
        })}
      </div>

      {fullSports.map(({ sport, venueId }) => (
        <WaitlistBoard key={sport} venueId={venueId} sport={sport} />
      ))}
    </div>
  );
}
