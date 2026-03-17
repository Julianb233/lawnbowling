/**
 * Seed 500 test users with realistic profiles, skill levels, team memberships,
 * friendships, player stats, bowls position ratings, and club memberships.
 *
 * Creates:
 *   - 500 auth users + player profiles with bowls-specific fields
 *   - Position-specific ELO ratings (skip/vice/second/lead/singles)
 *   - Player stats with realistic win/loss records
 *   - 50 teams with 4-8 members each
 *   - 750 friendships
 *   - Club memberships (players distributed across existing clubs)
 *   - Notification preferences
 *
 * Usage:
 *   npx tsx scripts/seed-500-users.ts
 *   npx tsx scripts/seed-500-users.ts --clean   # Remove previously seeded test users first
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Linear: AI-2432
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load env ───────────────────────────────────────────────────────────
const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  let val = trimmed.slice(eqIdx + 1);
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Constants ──────────────────────────────────────────────────────────

const TOTAL_USERS = 500;
const EMAIL_DOMAIN = "lawnbowl.test";
const PASSWORD = "TestPass123!";

const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Dorothy", "George", "Melissa",
  "Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon",
  "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
  "Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
  "Larry", "Pamela", "Justin", "Emma", "Scott", "Nicole", "Brandon", "Helen",
  "Benjamin", "Samantha", "Samuel", "Katherine", "Raymond", "Christine", "Gregory", "Debra",
  "Frank", "Rachel", "Alexander", "Carolyn", "Patrick", "Janet", "Jack", "Catherine",
  "Dennis", "Maria", "Jerry", "Heather", "Tyler", "Diane", "Aaron", "Ruth",
  "Jose", "Julie", "Nathan", "Olivia", "Henry", "Joyce", "Douglas", "Virginia",
  "Peter", "Victoria", "Adam", "Kelly", "Zachary", "Lauren", "Walter", "Christina",
  "Hiroshi", "Mei", "Wei", "Priya", "Raj", "Aisha", "Omar", "Fatima",
  "Carlos", "Elena", "Diego", "Valentina", "Marco", "Lucia", "Kenji", "Yuki",
  "Sanjay", "Anita", "Vikram", "Deepa", "Ravi", "Sunita", "Kofi", "Amara",
  "Ibrahim", "Zainab", "Kwame", "Nia", "Tao", "Lan", "Bao", "Linh",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
  "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
  "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
  "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
  "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza",
  "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers",
  "Long", "Ross", "Foster", "Jimenez", "Powell", "Jenkins", "Perry", "Russell",
  "Sullivan", "Bell", "Coleman", "Butler", "Henderson", "Barnes", "Gonzales", "Fisher",
  "Vasquez", "Simmons", "Graham", "Murray", "Ford", "Hamilton", "Tanaka", "Yamamoto",
  "Chen", "Wang", "Liu", "Zhang", "Li", "Singh", "Kumar", "Sharma",
  "Okafor", "Mensah", "Adeyemi", "Nkomo", "Tran", "Pham", "Nakamura", "Watanabe",
];

// ── Helpers ────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400_000).toISOString();
}

function padNum(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

function generateSkillLevel(index: number): "beginner" | "intermediate" | "advanced" {
  // ~30% beginner, ~45% intermediate, ~25% advanced
  const r = (index * 7 + 13) % 100;
  if (r < 30) return "beginner";
  if (r < 75) return "intermediate";
  return "advanced";
}

function winRateForSkill(skill: "beginner" | "intermediate" | "advanced"): number {
  switch (skill) {
    case "beginner": return randInt(20, 40);
    case "intermediate": return randInt(35, 60);
    case "advanced": return randInt(55, 80);
  }
}

// ── Bowls-specific constants ──────────────────────────────────────────

const POSITIONS = ["skip", "vice", "second", "lead"] as const;
const EXPERIENCE_LEVELS = ["brand_new", "learning", "social", "competitive", "representative"] as const;
const BOWLING_FORMATS = ["fours", "triples", "pairs", "singles"] as const;

const CLUB_NAMES_FOR_BIO = [
  "Beverly Hills Lawn Bowling Club", "San Francisco Lawn Bowling Club",
  "Santa Monica Bowls Club", "Laguna Beach LBC", "Palo Alto LBC",
  "Seattle Lawn Bowling Club", "Portland Lawn Bowling Club",
  "Denver Lawn Bowling Club", "Chicago Lakeside LBC", "New York Lawn Bowling Club",
  "Sun City Lawn Bowls", "Clearwater LBC", "Pinehurst Resort LBC",
  "Williamsburg Inn LBC", "Buck Hill Falls LBC",
];

const BIOS = [
  "Love getting outdoors and rolling a few ends with friends.",
  "Competitive bowler focusing on singles and pairs.",
  "Weekend social bowler. Always up for a friendly game!",
  "Recently retired and picked up lawn bowling. Hooked!",
  "Skip looking for regular pairs and triples partners.",
  "Vice-skip with 10+ years experience. Love pennant season.",
  "New to the sport but learning fast. Open to any format.",
  "Tournament regular — traveled to nationals twice.",
  "Social player who enjoys the community aspect most.",
  "Lead specialist — accurate draw is my strength.",
  "Been bowling since I was a kid in the UK.",
  "Moved from indoor bowls to outdoor and never looked back.",
  "Looking to join a competitive pennant team.",
  "Casual player, here mostly for the BBQ and beers afterwards.",
  "Coaching badge holder — happy to help newcomers.",
  null, null, null, null, null, // 25% chance of no bio
];

function generatePosition(index: number): "skip" | "vice" | "second" | "lead" | "any" {
  const r = (index * 11 + 3) % 100;
  if (r < 15) return "skip";
  if (r < 30) return "vice";
  if (r < 45) return "second";
  if (r < 60) return "lead";
  return "any";
}

function generateExperienceLevel(skill: string, index: number): string {
  if (skill === "beginner") return pick(["brand_new", "learning"]);
  if (skill === "intermediate") return pick(["learning", "social", "competitive"]);
  return pick(["competitive", "representative"]);
}

function generateYearsPlaying(skill: string): number {
  if (skill === "beginner") return randInt(0, 2);
  if (skill === "intermediate") return randInt(2, 10);
  return randInt(5, 35);
}

function generateBowlingFormats(skill: string): string[] {
  if (skill === "beginner") {
    return [pick(["pairs", "triples", "fours"])];
  }
  if (skill === "intermediate") {
    const count = randInt(2, 3);
    const shuffled = [...BOWLING_FORMATS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  // Advanced — play most formats
  return [...BOWLING_FORMATS].sort(() => Math.random() - 0.5).slice(0, randInt(3, 4));
}

function eloForSkillAndPosition(skill: string, position: string): number {
  const base = skill === "beginner" ? 900 : skill === "intermediate" ? 1200 : 1500;
  // Add position-specific variance
  const variance = randInt(-100, 100);
  // Preferred positions get a bonus
  return Math.max(600, Math.min(2000, base + variance));
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding ${TOTAL_USERS} test users for Lawnbowling...\n`);

  const isClean = process.argv.includes("--clean");

  // 0. Clean mode
  if (isClean) {
    console.log("0/6  Cleaning previous test users...");
    await cleanPreviousUsers();
  }

  // 1. Fetch existing venue (from seed-demo)
  console.log("1/6  Fetching venue...");
  const { data: venue } = await supabase
    .from("venues")
    .select("id")
    .limit(1)
    .maybeSingle();
  const venueId = venue?.id || null;
  console.log(`     Venue: ${venueId || "none"}`);

  // 2. Create auth users + player profiles
  console.log("2/6  Creating auth users and player profiles...");
  const playerIds: string[] = [];
  const playerSkills: ("beginner" | "intermediate" | "advanced")[] = [];
  let created = 0;
  let skipped = 0;

  // Process in batches to avoid overwhelming the API
  const BATCH_SIZE = 10;
  for (let batch = 0; batch < Math.ceil(TOTAL_USERS / BATCH_SIZE); batch++) {
    const start = batch * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, TOTAL_USERS);

    const batchPromises = [];
    for (let i = start; i < end; i++) {
      batchPromises.push(createUserAndPlayer(i, venueId));
    }

    const results = await Promise.all(batchPromises);
    for (const r of results) {
      playerIds.push(r.playerId);
      playerSkills.push(r.skill);
      if (r.created) created++;
      else skipped++;
    }

    if ((batch + 1) % 10 === 0 || end === TOTAL_USERS) {
      console.log(`     ${end}/${TOTAL_USERS} users processed (${created} new, ${skipped} existing)`);
    }
  }
  console.log(`     Total: ${created} created, ${skipped} already existed`);

  // 3. Player stats
  console.log("3/9  Creating player stats...");
  await createPlayerStats(playerIds, playerSkills);

  // 4. Bowls position ratings (ELO per position)
  console.log("4/9  Creating bowls position ratings...");
  await createPositionRatings(playerIds, playerSkills);

  // 5. Teams + memberships
  console.log("5/9  Creating teams and team memberships...");
  await createTeams(playerIds, venueId);

  // 6. Club memberships
  console.log("6/9  Creating club memberships...");
  await createClubMemberships(playerIds);

  // 7. Friendships
  console.log("7/9  Creating friendships...");
  await createFriendships(playerIds);

  // 8. Notification preferences
  console.log("8/9  Creating notification preferences...");
  await createNotificationPreferences(playerIds);

  // 9. Summary
  console.log("9/9  Done!\n");
  console.log("=== Seed Summary ===");
  console.log(`  Users created: ${created}`);
  console.log(`  Users existing: ${skipped}`);
  console.log(`  Total players: ${playerIds.length}`);
  console.log(`  Email pattern: testuser001@${EMAIL_DOMAIN} - testuser${padNum(TOTAL_USERS, 3)}@${EMAIL_DOMAIN}`);
  console.log(`  Password: ${PASSWORD}`);
}

// ── Create a single user + player ──────────────────────────────────────

async function createUserAndPlayer(
  index: number,
  venueId: string | null
): Promise<{ playerId: string; skill: "beginner" | "intermediate" | "advanced"; created: boolean }> {
  const num = index + 1;
  const email = `testuser${padNum(num, 3)}@${EMAIL_DOMAIN}`;
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(index * 3 + 7) % LAST_NAMES.length];
  const displayName = `${firstName} ${lastName}`;
  const skill = generateSkillLevel(index);
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + "+" + lastName)}&background=random&size=128`;

  // Create auth user
  let userId: string;
  let wasCreated = true;

  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });

  if (authErr) {
    if (authErr.message.includes("already") || authErr.message.includes("exists")) {
      // Find existing user by listing
      const { data: listData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = (listData?.users as { id: string; email?: string }[])?.find((u) => u.email === email);
      if (!existing) throw new Error(`Cannot find existing user ${email}`);
      userId = existing.id;
      wasCreated = false;
    } else {
      throw new Error(`Auth user creation failed for ${email}: ${authErr.message}`);
    }
  } else {
    userId = authUser.user.id;
  }

  // Check if player row exists
  const { data: existingPlayer } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let playerId: string;
  const preferredPosition = generatePosition(index);
  const yearsPlaying = generateYearsPlaying(skill);
  const experienceLevel = generateExperienceLevel(skill, index);
  const bowlingFormats = generateBowlingFormats(skill);
  const bio = pick(BIOS);
  const homeClubName = Math.random() > 0.3 ? pick(CLUB_NAMES_FOR_BIO) : null;

  if (existingPlayer) {
    playerId = existingPlayer.id;
    wasCreated = false;
  } else {
    const { data: player, error: playerErr } = await supabase
      .from("players")
      .insert({
        user_id: userId,
        display_name: displayName,
        avatar_url: avatarUrl,
        skill_level: skill,
        sports: ["lawn_bowling"],
        is_available: Math.random() > 0.6,
        venue_id: venueId,
        role: "player",
        preferred_position: preferredPosition,
        years_playing: yearsPlaying,
        experience_level: experienceLevel,
        bowling_formats: bowlingFormats,
        bio: bio,
        home_club_name: homeClubName,
        onboarding_completed: true,
      })
      .select("id")
      .single();
    if (playerErr) throw new Error(`Player insert failed for ${email}: ${playerErr.message}`);
    playerId = player.id;
  }

  return { playerId, skill, created: wasCreated };
}

// ── Player stats ───────────────────────────────────────────────────────

async function createPlayerStats(
  playerIds: string[],
  playerSkills: ("beginner" | "intermediate" | "advanced")[]
) {
  const rows: {
    player_id: string;
    games_played: number;
    wins: number;
    losses: number;
    win_rate: number;
    favorite_sport: string;
    last_played_at: string;
  }[] = [];

  for (let i = 0; i < playerIds.length; i++) {
    const skill = playerSkills[i];
    const gamesPlayed = skill === "beginner" ? randInt(3, 20) : skill === "intermediate" ? randInt(15, 60) : randInt(40, 150);
    const winRate = winRateForSkill(skill);
    const wins = Math.round(gamesPlayed * winRate / 100);
    const losses = gamesPlayed - wins;

    rows.push({
      player_id: playerIds[i],
      games_played: gamesPlayed,
      wins,
      losses,
      win_rate: winRate,
      favorite_sport: "lawn_bowling",
      last_played_at: daysAgo(randInt(0, 30)),
    });
  }

  // Upsert in batches
  const INSERT_BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const batch = rows.slice(i, i + INSERT_BATCH);
    const { error } = await supabase.from("player_stats").upsert(batch);
    if (error) {
      console.warn(`     Batch ${i} stats error: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`     ${inserted} player stats upserted`);
}

// ── Teams ──────────────────────────────────────────────────────────────

const TEAM_NAMES = [
  "Rolling Thunder", "Green Machine", "The Biased Ones", "Jack Hunters", "End Game",
  "Draw Masters", "Heavy Hitters", "Rink Rats", "Skip to My Lou", "Bowl Movements",
  "The Touchers", "Weight Watchers", "Dead Draws", "The Ditch Diggers", "Bowl Patrol",
  "Yard On", "The Heavies", "Short End", "Full Length", "Green Giants",
  "Bowled Over", "The Kitty Club", "Drive Time", "The Wickers", "Mat Matters",
  "Second Shots", "Lead Legends", "Vice Versa", "Skip Squad", "The Head Cases",
  "Bowl Stars", "Green Arrows", "The Rink Masters", "Lawn Order", "Bowl Britannia",
  "The Jacks", "Smooth Rollers", "The Short Jacks", "Line & Length", "Measure Up",
  "The Draw Specialists", "Triple Threat", "Four Play", "Pairs Paradise", "Singles Scene",
  "The Bias Club", "Green Dream", "Bowl Brothers", "The Lawn Rangers", "Turf Surfers",
];

async function createTeams(playerIds: string[], venueId: string | null) {
  const NUM_TEAMS = 50;
  const teamIds: string[] = [];

  for (let t = 0; t < NUM_TEAMS; t++) {
    const captainIdx = t * 8; // spread captains across the player pool
    if (captainIdx >= playerIds.length) break;

    const teamName = TEAM_NAMES[t % TEAM_NAMES.length];

    // Check if team already exists
    const { data: existingTeam } = await supabase
      .from("teams")
      .select("id")
      .eq("name", teamName)
      .maybeSingle();

    let teamId: string;
    if (existingTeam) {
      teamId = existingTeam.id;
    } else {
      const { data: team, error: teamErr } = await supabase
        .from("teams")
        .insert({
          name: teamName,
          sport: "lawn_bowling",
          captain_id: playerIds[captainIdx],
          venue_id: venueId,
          description: `${teamName} - a lawn bowling team`,
        })
        .select("id")
        .single();
      if (teamErr) {
        console.warn(`     Team "${teamName}" error: ${teamErr.message}`);
        continue;
      }
      teamId = team.id;
    }
    teamIds.push(teamId);
  }

  // Assign 4-8 members per team
  const memberRows: { team_id: string; player_id: string; role: string }[] = [];
  for (let t = 0; t < teamIds.length; t++) {
    const teamSize = randInt(4, 8);
    const startIdx = t * 8;

    // Captain
    memberRows.push({ team_id: teamIds[t], player_id: playerIds[startIdx], role: "captain" });

    // Other members
    for (let m = 1; m < teamSize && startIdx + m < playerIds.length; m++) {
      memberRows.push({ team_id: teamIds[t], player_id: playerIds[startIdx + m], role: "member" });
    }
  }

  // Insert, ignoring duplicates
  const INSERT_BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < memberRows.length; i += INSERT_BATCH) {
    const batch = memberRows.slice(i, i + INSERT_BATCH);
    const { error } = await supabase
      .from("team_members")
      .upsert(batch, { onConflict: "team_id,player_id", ignoreDuplicates: true });
    if (error) {
      console.warn(`     Team members batch error: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`     ${teamIds.length} teams, ${inserted} team memberships`);
}

// ── Friendships ────────────────────────────────────────────────────────

async function createFriendships(playerIds: string[]) {
  const NUM_FRIENDSHIPS = 750;
  const rows: { player_id: string; friend_id: string; status: string }[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < NUM_FRIENDSHIPS * 2; i++) {
    if (rows.length >= NUM_FRIENDSHIPS) break;

    const a = randInt(0, playerIds.length - 1);
    let b = randInt(0, playerIds.length - 1);
    if (a === b) b = (b + 1) % playerIds.length;

    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push({
      player_id: playerIds[a],
      friend_id: playerIds[b],
      status: Math.random() > 0.15 ? "accepted" : "pending",
    });
  }

  const INSERT_BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const batch = rows.slice(i, i + INSERT_BATCH);
    const { error } = await supabase
      .from("friendships")
      .upsert(batch, { onConflict: "player_id,friend_id", ignoreDuplicates: true });
    if (error) {
      console.warn(`     Friendships batch error: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`     ${inserted} friendships created`);
}

// ── Bowls Position Ratings ─────────────────────────────────────────────

async function createPositionRatings(
  playerIds: string[],
  playerSkills: ("beginner" | "intermediate" | "advanced")[]
) {
  const SEASON = "2026";
  const allPositions = ["skip", "vice", "second", "lead", "singles"] as const;
  const rows: {
    player_id: string;
    position: string;
    season: string;
    elo_rating: number;
    games_played: number;
    wins: number;
    losses: number;
    draws: number;
    shot_differential: number;
    ends_won: number;
    ends_played: number;
    ends_won_pct: number;
  }[] = [];

  for (let i = 0; i < playerIds.length; i++) {
    const skill = playerSkills[i];
    // Each player gets ratings for 1-4 positions (more experienced = more positions)
    const numPositions = skill === "beginner" ? randInt(1, 2) : skill === "intermediate" ? randInt(2, 3) : randInt(3, 5);
    const shuffledPositions = [...allPositions].sort(() => Math.random() - 0.5);
    const chosenPositions = shuffledPositions.slice(0, numPositions);

    for (const pos of chosenPositions) {
      const elo = eloForSkillAndPosition(skill, pos);
      const gamesPlayed = skill === "beginner" ? randInt(2, 15) : skill === "intermediate" ? randInt(10, 40) : randInt(25, 100);
      const winRate = winRateForSkill(skill) / 100;
      const wins = Math.round(gamesPlayed * winRate);
      const draws = Math.round(gamesPlayed * 0.05);
      const losses = gamesPlayed - wins - draws;
      const endsPlayed = gamesPlayed * randInt(14, 21); // avg ends per game
      const endsWon = Math.round(endsPlayed * (winRate * 0.8 + 0.1)); // correlated with win rate
      const shotDiff = skill === "beginner" ? randInt(-50, 10) : skill === "intermediate" ? randInt(-20, 40) : randInt(10, 120);

      rows.push({
        player_id: playerIds[i],
        position: pos,
        season: SEASON,
        elo_rating: elo,
        games_played: gamesPlayed,
        wins,
        losses,
        draws,
        shot_differential: shotDiff,
        ends_won: endsWon,
        ends_played: endsPlayed,
        ends_won_pct: endsPlayed > 0 ? Math.round((endsWon / endsPlayed) * 10000) / 100 : 0,
      });
    }
  }

  const INSERT_BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const batch = rows.slice(i, i + INSERT_BATCH);
    const { error } = await supabase
      .from("bowls_position_ratings")
      .upsert(batch, { onConflict: "player_id,position,season", ignoreDuplicates: true });
    if (error) {
      console.warn(`     Position ratings batch error: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`     ${inserted} position ratings created across ${playerIds.length} players`);
}

// ── Club Memberships ──────────────────────────────────────────────────

async function createClubMemberships(playerIds: string[]) {
  // Fetch existing clubs from the database
  const { data: clubs, error: clubErr } = await supabase
    .from("clubs")
    .select("id, name")
    .limit(100);

  if (clubErr || !clubs || clubs.length === 0) {
    console.log("     No clubs found in database, skipping club memberships");
    return;
  }

  const ROLES = ["member", "member", "member", "member", "visitor"] as const; // 80% member, 20% visitor
  const rows: {
    club_id: string;
    player_id: string;
    role: string;
    status: string;
    joined_at: string;
  }[] = [];

  // Each player joins 1-3 clubs
  for (let i = 0; i < playerIds.length; i++) {
    const numClubs = randInt(1, 3);
    const shuffledClubs = [...clubs].sort(() => Math.random() - 0.5);
    const chosenClubs = shuffledClubs.slice(0, Math.min(numClubs, clubs.length));

    for (const club of chosenClubs) {
      rows.push({
        club_id: club.id,
        player_id: playerIds[i],
        role: pick([...ROLES]),
        status: "active",
        joined_at: daysAgo(randInt(1, 365)),
      });
    }
  }

  const INSERT_BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const batch = rows.slice(i, i + INSERT_BATCH);
    const { error } = await supabase
      .from("club_memberships")
      .upsert(batch, { onConflict: "club_id,player_id", ignoreDuplicates: true });
    if (error) {
      console.warn(`     Club membership batch error: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`     ${inserted} club memberships across ${clubs.length} clubs`);
}

// ── Notification Preferences ──────────────────────────────────────────

async function createNotificationPreferences(playerIds: string[]) {
  const rows: {
    player_id: string;
    push_partner_requests: boolean;
    push_match_ready: boolean;
    push_friend_checkin: boolean;
    push_scheduled_reminder: boolean;
    email_weekly_summary: boolean;
    email_upcoming_games: boolean;
    profile_public: boolean;
    stats_public: boolean;
    event_reminders: boolean;
    new_events: boolean;
    tournament_results: boolean;
    chat_messages: boolean;
    club_announcements: boolean;
  }[] = [];

  for (const playerId of playerIds) {
    rows.push({
      player_id: playerId,
      push_partner_requests: Math.random() > 0.2,
      push_match_ready: Math.random() > 0.15,
      push_friend_checkin: Math.random() > 0.4,
      push_scheduled_reminder: Math.random() > 0.1,
      email_weekly_summary: Math.random() > 0.5,
      email_upcoming_games: Math.random() > 0.3,
      profile_public: Math.random() > 0.15,
      stats_public: Math.random() > 0.25,
      event_reminders: Math.random() > 0.2,
      new_events: Math.random() > 0.3,
      tournament_results: Math.random() > 0.15,
      chat_messages: Math.random() > 0.2,
      club_announcements: Math.random() > 0.15,
    });
  }

  const INSERT_BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const batch = rows.slice(i, i + INSERT_BATCH);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert(batch, { onConflict: "player_id", ignoreDuplicates: true });
    if (error) {
      console.warn(`     Notification prefs batch error: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`     ${inserted} notification preferences created`);
}

// ── Clean ──────────────────────────────────────────────────────────────

async function cleanPreviousUsers() {
  let totalDeleted = 0;

  // Paginate through auth users to find test accounts
  for (let page = 1; page <= 10; page++) {
    const { data: listData } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (!listData?.users?.length) break;

    const testUsers = listData.users.filter(
      (u: { email?: string }) => u.email?.endsWith(`@${EMAIL_DOMAIN}`)
    );
    if (testUsers.length === 0) {
      if (page === 1) console.log("     No test users found to clean");
      break;
    }

    for (const user of testUsers) {
      // Delete player first (cascades to stats, team members, friendships, etc.)
      await supabase.from("players").delete().eq("user_id", user.id);
      await supabase.auth.admin.deleteUser(user.id);
      totalDeleted++;
    }

    console.log(`     Deleted ${totalDeleted} test users so far...`);
  }
  console.log(`     Cleaned ${totalDeleted} test users total`);
}

// ── Run ────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error("\nSeed failed:", err.message || err);
  process.exit(1);
});
