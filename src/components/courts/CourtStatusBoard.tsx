"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CourtCard } from "./CourtCard";

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

  const fetchData = async () => {
    const supabase = createClient();

    const [courtsRes, matchesRes] = await Promise.all([
      supabase.from("courts").select("*").order("name"),
      supabase
        .from("matches")
        .select(
          "*, match_players(player_id, team, players(display_name, avatar_url))"
        )
        .in("status", ["queued", "playing"])
        .order("created_at", { ascending: true }),
    ]);

    if (courtsRes.data) setCourts(courtsRes.data);
    if (matchesRes.data) setMatches(matchesRes.data as ActiveMatch[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const supabase = createClient();

    // Subscribe to real-time changes
    const courtsChannel = supabase
      .channel("courts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courts" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(courtsChannel);
    };
  }, []);

  const handleComplete = async (matchId: string) => {
    const res = await fetch("/api/matches/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId }),
    });
    if (res.ok) fetchData();
  };

  const handleAssign = async (courtId: string) => {
    // Find first queued match for this court's sport
    const court = courts.find((c) => c.id === courtId);
    if (!court) return;

    const queuedMatch = matches.find(
      (m) => m.status === "queued" && m.sport === court.sport && !m.court_id
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
            className="h-40 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {courts.map((court) => {
        const activeMatch = matches.find(
          (m) => m.court_id === court.id && m.status === "playing"
        );
        const queuedMatch = matches.find(
          (m) =>
            m.status === "queued" && m.sport === court.sport && !m.court_id
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
  );
}
