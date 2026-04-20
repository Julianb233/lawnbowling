import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPushToPlayer } from "@/lib/push";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Creates a Supabase admin client using the service role key.
 * Webhooks don't have user cookies, so we use the service role for DB access.
 */
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Verify the webhook secret header matches our configured secret.
 * Returns true if the secret is valid or if no secret is configured (dev mode).
 */
function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn("SUPABASE_WEBHOOK_SECRET not set — skipping verification");
    return true;
  }
  const headerSecret = request.headers.get("x-supabase-webhook-secret");
  return headerSecret === secret;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, unknown>;
  old_record: Record<string, unknown> | null;
  timestamp: string;
}

/**
 * POST /api/webhooks/supabase
 *
 * Handles database change events sent by pg_net HTTP triggers.
 *
 * Events handled:
 *   - tournaments INSERT    → Notify club members about new tournament
 *   - bowls_checkins INSERT → Notify friends that a player checked in
 *   - matches UPDATE        → Notify players when match is completed
 *   - club_memberships INSERT → Notify club admins about new member
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook secret
    if (!verifyWebhookSecret(request)) {
      logger.warn("Supabase webhook rejected — invalid secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse payload
    const body: WebhookPayload = await request.json();
    const { type, table, record, old_record, timestamp } = body;

    logger.info("Supabase webhook received", {
      type,
      table,
      recordId: record?.id,
      timestamp,
    });

    // 3. Route to handler
    switch (table) {
      case "tournaments":
        if (type === "INSERT") await handleTournamentCreated(record);
        break;

      case "bowls_checkins":
        if (type === "INSERT") await handleCheckin(record);
        break;

      case "matches":
        if (type === "UPDATE") await handleMatchCompleted(record, old_record);
        break;

      case "club_memberships":
        if (type === "INSERT") await handleNewMembership(record);
        break;

      case "activity_feed":
        if (type === "INSERT") await handleActivityFeedItem(record);
        break;

      default:
        logger.info("Supabase webhook — unhandled table", { table, type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Supabase webhook processing error", {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    // Return 200 to prevent pg_net from retrying indefinitely
    return NextResponse.json({ received: true, error: "Processing failed" });
  }
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

/**
 * New tournament created — notify all members of the club.
 */
async function handleTournamentCreated(record: Record<string, unknown>) {
  const tournamentName = (record.name as string) ?? "New Tournament";
  const clubId = record.club_id as string | undefined;

  if (!clubId) {
    logger.warn("Tournament webhook missing club_id", { record });
    return;
  }

  const supabase = getSupabaseAdmin();

  // Get all players who are members of this club
  const { data: members, error } = await supabase
    .from("club_memberships")
    .select("player_id")
    .eq("club_id", clubId);

  if (error) {
    logger.error("Failed to fetch club members for tournament notification", {
      error,
      clubId,
    });
    return;
  }

  if (!members || members.length === 0) return;

  logger.info("Sending tournament notifications", {
    tournamentName,
    clubId,
    memberCount: members.length,
  });

  const results = await Promise.allSettled(
    members.map((m) =>
      sendPushToPlayer(m.player_id, "new_event", {
        title: "New Tournament",
        body: `${tournamentName} has been created at your club!`,
        tag: `tournament-${record.id}`,
        url: `/tournament/${record.id}`,
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  logger.info("Tournament notifications sent", { sent, total: members.length });
}

/**
 * Player checked in — notify their friends who are also at the venue.
 */
async function handleCheckin(record: Record<string, unknown>) {
  const playerId = record.player_id as string | undefined;
  const clubId = record.club_id as string | undefined;

  if (!playerId || !clubId) {
    logger.warn("Checkin webhook missing player_id or club_id", { record });
    return;
  }

  const supabase = getSupabaseAdmin();

  // Get the player's display name
  const { data: player } = await supabase
    .from("players")
    .select("display_name")
    .eq("id", playerId)
    .single();

  const playerName = player?.display_name ?? "A friend";

  // Get friends of this player
  const { data: friendships, error } = await supabase
    .from("friends")
    .select("friend_id, player_id")
    .or(`player_id.eq.${playerId},friend_id.eq.${playerId}`)
    .eq("status", "accepted");

  if (error || !friendships || friendships.length === 0) return;

  // Get the friend IDs (the other side of the friendship)
  const friendIds = friendships.map((f) =>
    f.player_id === playerId ? f.friend_id : f.player_id
  );

  logger.info("Sending checkin notifications to friends", {
    playerId,
    friendCount: friendIds.length,
  });

  await Promise.allSettled(
    friendIds.map((friendId: string) =>
      sendPushToPlayer(friendId, "court_available", {
        title: "Friend Checked In",
        body: `${playerName} just checked in — head to the green!`,
        tag: `checkin-${record.id}`,
        url: `/board`,
      })
    )
  );
}

/**
 * Match completed — notify all players in the match with results.
 */
async function handleMatchCompleted(
  record: Record<string, unknown>,
  oldRecord: Record<string, unknown> | null
) {
  // Only handle transitions to terminal statuses
  const terminalStatuses = ["completed", "cancelled", "abandoned", "disputed"];
  if (!terminalStatuses.includes(record.status as string)) return;
  if (oldRecord && terminalStatuses.includes(oldRecord.status as string)) return;

  const matchId = record.id as string;

  const supabase = getSupabaseAdmin();

  // Get players involved in the match
  const { data: matchPlayers, error } = await supabase
    .from("match_players")
    .select("player_id")
    .eq("match_id", matchId);

  if (error || !matchPlayers || matchPlayers.length === 0) {
    logger.warn("No players found for completed match", { matchId });
    return;
  }

  logger.info("Sending match completed notifications", {
    matchId,
    playerCount: matchPlayers.length,
  });

  await Promise.allSettled(
    matchPlayers.map((mp) =>
      sendPushToPlayer(mp.player_id, "tournament_result", {
        title: "Match Complete",
        body: "Your match results are in — check the scoreboard!",
        tag: `match-complete-${matchId}`,
        url: `/match/${matchId}`,
      })
    )
  );
}

/**
 * Activity feed item created — notify relevant players (friends).
 */
async function handleActivityFeedItem(record: Record<string, unknown>) {
  const playerId = record.player_id as string | undefined;
  const type = record.type as string | undefined;

  if (!playerId || !type) return;

  const supabase = getSupabaseAdmin();

  // Get the player's name
  const { data: player } = await supabase
    .from("players")
    .select("display_name")
    .eq("id", playerId)
    .single();

  const playerName = player?.display_name ?? "Someone";

  // Build notification content based on activity type
  const notifMap: Record<string, { title: string; body: string }> = {
    match_complete: {
      title: "Match Result",
      body: `${playerName} just finished a match!`,
    },
    friend_accepted: {
      title: "New Connection",
      body: `${playerName} accepted a friend request`,
    },
    achievement_unlocked: {
      title: "Achievement Unlocked",
      body: `${playerName} earned a new achievement!`,
    },
    new_player: {
      title: "New Member",
      body: `${playerName} joined the club!`,
    },
    scheduled_game: {
      title: "Game Scheduled",
      body: `${playerName} scheduled a new game`,
    },
  };

  const notif = notifMap[type];
  if (!notif) return; // Not a type we send push for

  // Get friends to notify
  const { data: friendships } = await supabase
    .from("friendships")
    .select("friend_id, player_id")
    .or(`player_id.eq.${playerId},friend_id.eq.${playerId}`)
    .eq("status", "accepted");

  if (!friendships || friendships.length === 0) return;

  const friendIds = friendships.map((f) =>
    f.player_id === playerId ? f.friend_id : f.player_id
  );

  logger.info("Sending activity feed notifications", {
    type,
    playerId,
    friendCount: friendIds.length,
  });

  await Promise.allSettled(
    friendIds.map((friendId: string) =>
      sendPushToPlayer(friendId, "club_announcement", {
        title: notif.title,
        body: notif.body,
        tag: `activity-${record.id}`,
        url: "/activity",
      })
    )
  );
}

/**
 * New club membership — notify club admins.
 */
async function handleNewMembership(record: Record<string, unknown>) {
  const clubId = record.club_id as string | undefined;
  const playerId = record.player_id as string | undefined;

  if (!clubId || !playerId) {
    logger.warn("Membership webhook missing club_id or player_id", { record });
    return;
  }

  const supabase = getSupabaseAdmin();

  // Get new member name
  const { data: player } = await supabase
    .from("players")
    .select("display_name")
    .eq("id", playerId)
    .single();

  const memberName = player?.display_name ?? "A new member";

  // Get club admins
  const { data: admins, error } = await supabase
    .from("club_memberships")
    .select("player_id")
    .eq("club_id", clubId)
    .eq("role", "admin");

  if (error || !admins || admins.length === 0) return;

  logger.info("Sending new membership notifications to admins", {
    clubId,
    adminCount: admins.length,
    newMember: playerId,
  });

  await Promise.allSettled(
    admins.map((admin) =>
      sendPushToPlayer(admin.player_id, "club_announcement", {
        title: "New Club Member",
        body: `${memberName} just joined your club!`,
        tag: `membership-${record.id}`,
        url: `/clubs/${clubId}/members`,
      })
    )
  );
}
