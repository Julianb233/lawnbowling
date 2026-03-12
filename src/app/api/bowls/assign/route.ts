import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateSmartAssignment,
  checkinsToAssignmentPlayers,
} from "@/lib/team-assignment-engine";
import type { AssignmentConfig, LockedAssignment } from "@/lib/team-assignment-engine";
import type { BowlsCheckin, BowlsGameFormat, BowlsPositionRating } from "@/lib/types";

/**
 * POST /api/bowls/assign
 * Generate smart team assignments from checked-in players.
 * Body: {
 *   tournament_id: string,
 *   format: BowlsGameFormat,
 *   locked_assignments?: LockedAssignment[],
 *   weights?: { skill: number; position: number; variety: number; social: number }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tournament_id,
      format,
      locked_assignments,
      weights,
    } = body as {
      tournament_id: string;
      format: BowlsGameFormat;
      locked_assignments?: LockedAssignment[];
      weights?: { skill: number; position: number; variety: number; social: number };
    };

    if (!tournament_id || !format) {
      return NextResponse.json(
        { error: "tournament_id and format required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get checked-in players
    const { data: checkins, error: checkinError } = await supabase
      .from("bowls_checkins")
      .select("*, player:players(id, display_name, avatar_url, skill_level)")
      .eq("tournament_id", tournament_id)
      .order("checked_in_at", { ascending: true });

    if (checkinError) {
      return NextResponse.json({ error: checkinError.message }, { status: 500 });
    }

    if (!checkins || checkins.length === 0) {
      return NextResponse.json(
        { error: "No checked-in players found" },
        { status: 400 }
      );
    }

    // Get position ratings for all checked-in players
    const playerIds = checkins.map((c: BowlsCheckin) => c.player_id);
    const { data: positionRatings } = await supabase
      .from("bowls_position_ratings")
      .select("*")
      .in("player_id", playerIds);

    // Get match history for variety scoring
    const { data: matchHistory } = await supabase
      .from("match_players")
      .select("match_id, player_id, team")
      .in("player_id", playerIds);

    // Build match history pairs (players who were on the same team)
    const matchTeams = new Map<string, { player_id: string; team: number }[]>();
    if (matchHistory) {
      for (const mp of matchHistory) {
        const key = `${mp.match_id}:${mp.team}`;
        if (!matchTeams.has(key)) matchTeams.set(key, []);
        matchTeams.get(key)!.push({ player_id: mp.player_id, team: mp.team });
      }
    }

    const historyRecords: { player_a_id: string; player_b_id: string; times_together: number }[] = [];
    const pairCounts = new Map<string, number>();
    for (const [, teammates] of matchTeams) {
      for (let i = 0; i < teammates.length; i++) {
        for (let j = i + 1; j < teammates.length; j++) {
          const pairKey = [teammates[i].player_id, teammates[j].player_id].sort().join(":");
          pairCounts.set(pairKey, (pairCounts.get(pairKey) ?? 0) + 1);
        }
      }
    }
    for (const [key, count] of pairCounts) {
      const [a, b] = key.split(":");
      historyRecords.push({ player_a_id: a, player_b_id: b, times_together: count });
    }

    // Get partner preferences
    const { data: partnerRequests } = await supabase
      .from("partner_requests")
      .select("requester_id, target_id")
      .in("requester_id", playerIds)
      .eq("status", "accepted");

    const partnerPreferences = (partnerRequests ?? []).map((r) => ({
      requester_id: r.requester_id,
      target_id: r.target_id,
    }));

    // Convert to assignment players
    const assignmentPlayers = checkinsToAssignmentPlayers(
      checkins as BowlsCheckin[],
      (positionRatings as BowlsPositionRating[]) ?? []
    );

    // Build config
    const config: AssignmentConfig = {
      format,
      weights,
      lockedAssignments: locked_assignments,
      matchHistory: historyRecords,
      partnerPreferences,
    };

    // Generate assignment
    const result = generateSmartAssignment(assignmentPlayers, config);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Smart assignment error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Assignment generation failed" },
      { status: 500 }
    );
  }
}
