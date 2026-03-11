/**
 * Production seed script for Lawnbowling demo data.
 *
 * Creates:
 *   - 1 demo venue (Sunset Recreation Center)
 *   - 8 courts (pickleball, tennis, lawn bowling)
 *   - 12 sample players with auth accounts
 *   - 6 completed matches with results
 *   - Player stats, sport skills, and activity feed entries
 *
 * Usage:
 *   npx tsx scripts/seed-demo.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load env from .env.local
const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  let val = trimmed.slice(eqIdx + 1);
  // Strip surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Demo venue ──────────────────────────────────────────────────────

const VENUE = {
  name: "Sunset Recreation Center",
  address: "4850 W Sunset Blvd, Los Angeles, CA 90027",
  timezone: "America/Los_Angeles",
  logo_url: null,
  primary_color: "#f59e0b",
  secondary_color: "#1e293b",
  tagline: "Play. Connect. Compete.",
  contact_email: "info@sunsetrec.example.com",
  contact_phone: "(323) 555-0142",
  website_url: "https://sunsetrec.example.com",
  sports: ["pickleball", "tennis", "lawn_bowling"],
  operating_hours: {
    monday: { open: "06:00", close: "21:00" },
    tuesday: { open: "06:00", close: "21:00" },
    wednesday: { open: "06:00", close: "21:00" },
    thursday: { open: "06:00", close: "21:00" },
    friday: { open: "06:00", close: "22:00" },
    saturday: { open: "07:00", close: "22:00" },
    sunday: { open: "07:00", close: "20:00" },
  },
};

// ── Courts ──────────────────────────────────────────────────────────

const COURTS = [
  { name: "Pickleball Court 1", sport: "pickleball" },
  { name: "Pickleball Court 2", sport: "pickleball" },
  { name: "Pickleball Court 3", sport: "pickleball" },
  { name: "Tennis Court A", sport: "tennis" },
  { name: "Tennis Court B", sport: "tennis" },
  { name: "Tennis Court C", sport: "tennis" },
  { name: "Lawn Green 1", sport: "lawn_bowling" },
  { name: "Lawn Green 2", sport: "lawn_bowling" },
];

// ── Demo players ────────────────────────────────────────────────────

interface DemoPlayer {
  email: string;
  display_name: string;
  skill_level: "beginner" | "intermediate" | "advanced";
  sports: string[];
  role: "player" | "admin";
}

const DEMO_PLAYERS: DemoPlayer[] = [
  { email: "tori@sunsetrec.example.com", display_name: "Tori Martinez", skill_level: "advanced", sports: ["pickleball", "tennis"], role: "admin" },
  { email: "alex.chen@example.com", display_name: "Alex Chen", skill_level: "advanced", sports: ["pickleball", "tennis", "lawn_bowling"], role: "player" },
  { email: "jamie.ross@example.com", display_name: "Jamie Ross", skill_level: "intermediate", sports: ["pickleball"], role: "player" },
  { email: "sam.taylor@example.com", display_name: "Sam Taylor", skill_level: "beginner", sports: ["pickleball", "tennis"], role: "player" },
  { email: "morgan.lee@example.com", display_name: "Morgan Lee", skill_level: "advanced", sports: ["tennis"], role: "player" },
  { email: "casey.nguyen@example.com", display_name: "Casey Nguyen", skill_level: "intermediate", sports: ["pickleball", "lawn_bowling"], role: "player" },
  { email: "pat.hernandez@example.com", display_name: "Pat Hernandez", skill_level: "beginner", sports: ["lawn_bowling"], role: "player" },
  { email: "drew.kim@example.com", display_name: "Drew Kim", skill_level: "intermediate", sports: ["pickleball", "tennis"], role: "player" },
  { email: "riley.jackson@example.com", display_name: "Riley Jackson", skill_level: "advanced", sports: ["pickleball", "lawn_bowling"], role: "player" },
  { email: "quinn.wright@example.com", display_name: "Quinn Wright", skill_level: "beginner", sports: ["tennis", "lawn_bowling"], role: "player" },
  { email: "jordan.patel@example.com", display_name: "Jordan Patel", skill_level: "intermediate", sports: ["pickleball", "tennis"], role: "player" },
  { email: "avery.brooks@example.com", display_name: "Avery Brooks", skill_level: "advanced", sports: ["pickleball", "tennis", "lawn_bowling"], role: "player" },
];

// ── Helpers ──────────────────────────────────────────────────────────

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400_000).toISOString();
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding demo data for Lawnbowling...\n");

  // 0. Clean mode: wipe previous demo data if --clean flag is passed
  if (process.argv.includes("--clean")) {
    console.log("0/9  Cleaning previous demo data...");
    const { data: oldVenues } = await supabase
      .from("venues")
      .select("id")
      .eq("name", VENUE.name);
    if (oldVenues && oldVenues.length > 0) {
      for (const v of oldVenues) {
        // Delete cascading data tied to venue
        await supabase.from("activity_feed").delete().eq("venue_id", v.id);
        await supabase.from("court_waitlist").delete().eq("venue_id", v.id);

        // Delete tournaments and bowls check-ins
        try {
          const { data: vTournaments } = await supabase.from("tournaments").select("id").eq("venue_id", v.id);
          if (vTournaments) {
            for (const t of vTournaments) {
              await supabase.from("bowls_checkins").delete().eq("tournament_id", t.id);
            }
            await supabase.from("tournaments").delete().eq("venue_id", v.id);
          }
        } catch { /* tables may not exist */ }

        // Delete matches and their children
        const { data: vMatches } = await supabase.from("matches").select("id").eq("venue_id", v.id);
        if (vMatches) {
          for (const m of vMatches) {
            await supabase.from("match_results").delete().eq("match_id", m.id);
            await supabase.from("match_players").delete().eq("match_id", m.id);
          }
          await supabase.from("matches").delete().eq("venue_id", v.id);
        }

        // Delete players and their children
        const { data: vPlayers } = await supabase.from("players").select("id, user_id").eq("venue_id", v.id);
        if (vPlayers) {
          for (const p of vPlayers) {
            await supabase.from("player_stats").delete().eq("player_id", p.id);
            await supabase.from("player_sport_skills").delete().eq("player_id", p.id).then(() => {});
            // Delete auth user
            await supabase.auth.admin.deleteUser(p.user_id);
          }
          await supabase.from("players").delete().eq("venue_id", v.id);
        }

        await supabase.from("courts").delete().eq("venue_id", v.id);
        await supabase.from("venues").delete().eq("id", v.id);
      }
      console.log(`     Cleaned ${oldVenues.length} previous venue(s)`);
    } else {
      console.log("     Nothing to clean");
    }
  }

  // 1. Venue
  console.log("1/9  Creating venue...");

  // Check if venue already exists (idempotent)
  const { data: existingVenue } = await supabase
    .from("venues")
    .select("id")
    .eq("name", VENUE.name)
    .maybeSingle();

  let venueId: string;
  if (existingVenue) {
    venueId = existingVenue.id;
    console.log(`     Venue already exists: ${venueId}`);
  } else {
    const { data: venue, error: venueErr } = await supabase
      .from("venues")
      .insert(VENUE)
      .select("id")
      .single();
    if (venueErr) throw new Error(`Venue insert failed: ${venueErr.message}`);
    venueId = venue.id;
    console.log(`     Venue: ${venueId}`);
  }

  // 2. Courts
  console.log("2/9  Creating courts...");
  const { data: existingCourts } = await supabase
    .from("courts")
    .select("id, name, sport")
    .eq("venue_id", venueId);

  let courts: { id: string; name: string; sport: string }[];
  if (existingCourts && existingCourts.length >= COURTS.length) {
    courts = existingCourts;
    console.log(`     ${courts.length} courts already exist`);
  } else {
    const courtsPayload = COURTS.map((c) => ({ ...c, venue_id: venueId, is_available: true }));
    const { data: newCourts, error: courtsErr } = await supabase
      .from("courts")
      .insert(courtsPayload)
      .select("id, name, sport");
    if (courtsErr) throw new Error(`Courts insert failed: ${courtsErr.message}`);
    courts = newCourts;
    console.log(`     ${courts.length} courts created`);
  }

  // 3. Auth users + players
  console.log("3/9  Creating demo players...");
  const playerIds: string[] = [];
  const playerMap: Record<string, string> = {}; // email -> player id

  for (const dp of DEMO_PLAYERS) {
    // Create auth user (idempotent-ish: if email already exists, fetch it)
    let userId: string;
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: dp.email,
      password: "DemoPass123!",
      email_confirm: true,
    });

    if (authErr) {
      if (authErr.message.includes("already been registered") || authErr.message.includes("already exists")) {
        // Fetch existing user
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = (listData?.users as { id: string; email?: string }[])?.find((u) => u.email === dp.email);
        if (!existing) throw new Error(`Cannot find existing user for ${dp.email}`);
        userId = existing.id;
      } else {
        throw new Error(`Auth user creation failed for ${dp.email}: ${authErr.message}`);
      }
    } else {
      userId = authUser.user.id;
    }

    // Check if player row already exists for this user_id
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let playerId: string;
    if (existingPlayer) {
      playerId = existingPlayer.id;
    } else {
      const { data: player, error: playerErr } = await supabase
        .from("players")
        .insert({
          user_id: userId,
          display_name: dp.display_name,
          skill_level: dp.skill_level,
          sports: dp.sports,
          is_available: false,
          venue_id: venueId,
          role: dp.role,
        })
        .select("id")
        .single();
      if (playerErr) throw new Error(`Player insert failed for ${dp.email}: ${playerErr.message}`);
      playerId = player.id;
    }

    playerIds.push(playerId);
    playerMap[dp.email] = playerId;
    console.log(`     ${dp.display_name} (${dp.skill_level})`);
  }

  // Build court lookups
  const courtsBySport: Record<string, { id: string; name: string }[]> = {};
  for (const c of courts) {
    if (!courtsBySport[c.sport]) courtsBySport[c.sport] = [];
    courtsBySport[c.sport].push(c);
  }

  // 4. Matches + results
  console.log("4/9  Creating sample matches...");

  interface MatchDef {
    sport: string;
    courtIdx: number;
    team1: number[]; // indices into playerIds
    team2: number[];
    winnerTeam: 1 | 2;
    score1: number;
    score2: number;
    daysAgoVal: number;
  }

  const matchDefs: MatchDef[] = [
    { sport: "pickleball", courtIdx: 0, team1: [0, 1], team2: [2, 3], winnerTeam: 1, score1: 11, score2: 7, daysAgoVal: 7 },
    { sport: "pickleball", courtIdx: 1, team1: [4, 5], team2: [6, 7], winnerTeam: 2, score1: 9, score2: 11, daysAgoVal: 5 },
    { sport: "tennis", courtIdx: 0, team1: [0, 4], team2: [7, 10], winnerTeam: 1, score1: 6, score2: 3, daysAgoVal: 4 },
    { sport: "tennis", courtIdx: 1, team1: [1, 11], team2: [3, 9], winnerTeam: 2, score1: 4, score2: 6, daysAgoVal: 3 },
    { sport: "lawn_bowling", courtIdx: 0, team1: [5, 8], team2: [6, 9], winnerTeam: 1, score1: 21, score2: 15, daysAgoVal: 2 },
    { sport: "pickleball", courtIdx: 2, team1: [2, 10], team2: [8, 11], winnerTeam: 2, score1: 8, score2: 11, daysAgoVal: 1 },
  ];

  for (const md of matchDefs) {
    const court = courtsBySport[md.sport]?.[md.courtIdx];
    const startedAt = daysAgo(md.daysAgoVal);
    const endedAt = new Date(new Date(startedAt).getTime() + 45 * 60_000).toISOString();

    const { data: match, error: matchErr } = await supabase
      .from("matches")
      .insert({
        sport: md.sport,
        court_id: court?.id ?? null,
        venue_id: venueId,
        status: "completed",
        started_at: startedAt,
        ended_at: endedAt,
      })
      .select("id")
      .single();
    if (matchErr) throw new Error(`Match insert failed: ${matchErr.message}`);

    // Match players
    const mpRows = [
      ...md.team1.map((idx) => ({ match_id: match.id, player_id: playerIds[idx], team: 1 as const })),
      ...md.team2.map((idx) => ({ match_id: match.id, player_id: playerIds[idx], team: 2 as const })),
    ];
    const { error: mpErr } = await supabase.from("match_players").insert(mpRows);
    if (mpErr) throw new Error(`Match players insert failed: ${mpErr.message}`);

    // Match result
    const { error: mrErr } = await supabase.from("match_results").insert({
      match_id: match.id,
      winner_team: md.winnerTeam,
      team1_score: md.score1,
      team2_score: md.score2,
      reported_by: playerIds[md.team1[0]],
    });
    if (mrErr) throw new Error(`Match result insert failed: ${mrErr.message}`);

    console.log(`     ${md.sport} match (${md.score1}-${md.score2})`);
  }

  // 5. Player stats
  console.log("5/9  Computing player stats...");

  // Tally wins/losses from match defs
  const statsMap: Record<string, { games: number; wins: number; losses: number; favSport: string }> = {};
  for (const pid of playerIds) {
    statsMap[pid] = { games: 0, wins: 0, losses: 0, favSport: "pickleball" };
  }

  for (const md of matchDefs) {
    const winners = md.winnerTeam === 1 ? md.team1 : md.team2;
    const losers = md.winnerTeam === 1 ? md.team2 : md.team1;
    for (const idx of winners) {
      statsMap[playerIds[idx]].games++;
      statsMap[playerIds[idx]].wins++;
      statsMap[playerIds[idx]].favSport = md.sport;
    }
    for (const idx of losers) {
      statsMap[playerIds[idx]].games++;
      statsMap[playerIds[idx]].losses++;
      statsMap[playerIds[idx]].favSport = md.sport;
    }
  }

  const statsRows = playerIds.map((pid) => {
    const s = statsMap[pid];
    return {
      player_id: pid,
      games_played: s.games,
      wins: s.wins,
      losses: s.losses,
      win_rate: s.games > 0 ? Math.round((s.wins / s.games) * 100) : 0,
      favorite_sport: s.favSport,
      last_played_at: daysAgo(1),
    };
  });

  const { error: statsErr } = await supabase.from("player_stats").upsert(statsRows);
  if (statsErr) throw new Error(`Stats upsert failed: ${statsErr.message}`);
  console.log(`     Stats for ${statsRows.length} players`);

  // 6. Sport skills (optional -- table may not be deployed yet)
  console.log("6/9  Seeding sport skill ratings...");
  try {
    const skillRows: {
      player_id: string;
      sport: string;
      skill_level: string;
      games_in_sport: number;
      rating: number;
    }[] = [];

    const ratingByLevel: Record<string, number> = {
      beginner: 900,
      intermediate: 1100,
      advanced: 1300,
    };

    for (let i = 0; i < DEMO_PLAYERS.length; i++) {
      const dp = DEMO_PLAYERS[i];
      const pid = playerIds[i];
      for (const sport of dp.sports) {
        const gamesForSport = matchDefs
          .filter((md) => md.sport === sport && [...md.team1, ...md.team2].includes(i))
          .length;

        skillRows.push({
          player_id: pid,
          sport,
          skill_level: dp.skill_level,
          games_in_sport: gamesForSport,
          rating: ratingByLevel[dp.skill_level] + Math.floor(Math.random() * 100 - 50),
        });
      }
    }

    const { error: skillErr } = await supabase.from("player_sport_skills").upsert(skillRows);
    if (skillErr) {
      console.warn(`     Skipped: ${skillErr.message}`);
    } else {
      console.log(`     ${skillRows.length} sport skill entries`);
    }
  } catch (e) {
    console.warn(`     Skipped sport skills: ${e}`);
  }

  // 7. Activity feed (optional -- table may not be deployed yet)
  console.log("7/9  Populating activity feed...");
  try {
    const feedRows = [
      { venue_id: venueId, player_id: playerIds[0], type: "check_in", metadata: { sport: "pickleball" }, created_at: hoursAgo(2) },
      { venue_id: venueId, player_id: playerIds[1], type: "check_in", metadata: { sport: "tennis" }, created_at: hoursAgo(3) },
      { venue_id: venueId, player_id: playerIds[2], type: "new_player", metadata: {}, created_at: daysAgo(5) },
      { venue_id: venueId, player_id: playerIds[8], type: "match_complete", metadata: { sport: "lawn_bowling", score: "21-15" }, created_at: daysAgo(2) },
      { venue_id: venueId, player_id: playerIds[10], type: "match_complete", metadata: { sport: "pickleball", score: "11-8" }, created_at: daysAgo(1) },
    ];

    const { error: feedErr } = await supabase.from("activity_feed").insert(feedRows);
    if (feedErr) {
      console.warn(`     Skipped: ${feedErr.message}`);
    } else {
      console.log(`     ${feedRows.length} activity entries`);
    }
  } catch (e) {
    console.warn(`     Skipped activity feed: ${e}`);
  }

  // 8. Bowls tournament
  console.log("8/9  Creating bowls tournament...");
  let tournamentId: string | null = null;
  try {
    const { data: tournament, error: tournamentErr } = await supabase
      .from("tournaments")
      .insert({
        name: "Saturday Social Bowls",
        sport: "lawn_bowling",
        format: "fours",
        max_players: 32,
        status: "registration",
        venue_id: venueId,
        created_by: playerIds[0],
      })
      .select("id")
      .single();
    if (tournamentErr) {
      console.warn(`     Skipped: ${tournamentErr.message}`);
    } else {
      tournamentId = tournament.id;
      console.log(`     Tournament: ${tournamentId}`);
    }
  } catch (e) {
    console.warn(`     Skipped bowls tournament: ${e}`);
  }

  // 9. Bowls check-ins
  console.log("9/9  Creating bowls check-ins...");
  try {
    if (tournamentId) {
      const checkinRows = [
        { tournament_id: tournamentId, player_id: playerIds[1], position: "skip" },    // Alex Chen
        { tournament_id: tournamentId, player_id: playerIds[5], position: "vice" },    // Casey Nguyen
        { tournament_id: tournamentId, player_id: playerIds[6], position: "lead" },    // Pat Hernandez
        { tournament_id: tournamentId, player_id: playerIds[8], position: "skip" },    // Riley Jackson
        { tournament_id: tournamentId, player_id: playerIds[9], position: "second" },  // Quinn Wright
        { tournament_id: tournamentId, player_id: playerIds[11], position: "vice" },   // Avery Brooks
      ];

      const { error: checkinErr } = await supabase.from("bowls_checkins").insert(checkinRows);
      if (checkinErr) {
        console.warn(`     Skipped: ${checkinErr.message}`);
      } else {
        console.log(`     ${checkinRows.length} bowls check-ins created`);
      }
    } else {
      console.warn("     Skipped: no tournament was created");
    }
  } catch (e) {
    console.warn(`     Skipped bowls check-ins: ${e}`);
  }

  console.log("\nSeed complete.");
  console.log(`  Venue ID: ${venueId}`);
  console.log(`  Courts: ${courts.length}`);
  console.log(`  Players: ${playerIds.length}`);
  console.log(`  Matches: ${matchDefs.length}`);
  console.log(`  Demo admin: tori@sunsetrec.example.com / DemoPass123!`);
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message || err);
  process.exit(1);
});
