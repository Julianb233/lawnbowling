#!/usr/bin/env npx tsx
/**
 * Autoresearch Eval Runner for Player Features
 *
 * Reads source files and runs binary evals to score feature quality.
 * Output: scorecard + identified issues for next iteration.
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

interface EvalResult {
  name: string;
  pass: boolean;
  issues: string[];
}

// ─── EVAL 1: Profile Validation ───────────────────────────────
function evalProfileValidation(): EvalResult {
  const issues: string[] = [];
  const content = readFile("src/app/api/profile/route.ts");

  if (!content.includes(".trim()")) issues.push("display_name not trimmed");
  if (!content.includes("400")) issues.push("no 400 error for invalid input");
  if (!content.includes("409")) issues.push("no 409 for duplicate profiles");
  if (!content.includes("500")) issues.push("no bio truncation to 500 chars");

  return { name: "Profile Validation", pass: issues.length === 0, issues };
}

// ─── EVAL 2: Search Sanitization ──────────────────────────────
function evalSearchSanitization(): EvalResult {
  const issues: string[] = [];
  const content = readFile("src/app/api/search/route.ts");

  if (!content.includes(".trim()")) issues.push("query not trimmed");
  if (!content.includes("< 2")) issues.push("no minimum query length check");
  if (!content.includes(".limit(")) issues.push("no result limit");
  if (!content.includes("ilike")) issues.push("not case-insensitive");

  return { name: "Search Sanitization", pass: issues.length === 0, issues };
}

// ─── EVAL 3: Friend Request Auth ──────────────────────────────
function evalFriendRequestAuth(): EvalResult {
  const issues: string[] = [];
  const files = [
    "src/app/api/friends/route.ts",
    "src/app/api/friends/respond/route.ts",
    "src/app/api/friends/block/route.ts",
  ];

  for (const file of files) {
    const content = readFile(file);
    if (!content.includes("getUser()")) issues.push(`no auth check in ${path.basename(file)}`);
    if (!content.includes("401")) issues.push(`no 401 response in ${path.basename(file)}`);
  }

  return { name: "Friend Request Auth", pass: issues.length === 0, issues };
}

// ─── EVAL 4: Gallery Validation ───────────────────────────────
function evalGalleryValidation(): EvalResult {
  const issues: string[] = [];
  const content = readFile("src/app/api/profile/gallery/route.ts");

  if (!content.includes("MAX_PHOTOS") && !content.includes("12")) issues.push("no photo count limit");
  if (!content.includes("image/")) issues.push("no file type validation");
  if (!content.includes("5 * 1024 * 1024")) issues.push("no file size validation");
  if (!content.includes("formData")) issues.push("no multipart form handling");

  return { name: "Gallery Validation", pass: issues.length === 0, issues };
}

// ─── EVAL 5: Search Debounce ──────────────────────────────────
function evalSearchDebounce(): EvalResult {
  const issues: string[] = [];
  const content = readFile("src/components/social/PlayerSearch.tsx");

  if (!content.includes("setTimeout")) issues.push("no debouncing");
  if (!content.includes("clearTimeout")) issues.push("no debounce cleanup");
  if (!content.includes("300") && !content.includes("500")) issues.push("no reasonable debounce delay");

  return { name: "Search Debounce", pass: issues.length === 0, issues };
}

// ─── EVAL 6: Self-Filtering ──────────────────────────────────
function evalSelfFiltering(): EvalResult {
  const issues: string[] = [];
  const content = readFile("src/components/social/PlayerSearch.tsx");

  if (!content.includes("currentPlayerId")) issues.push("doesn't filter out self");
  if (!content.includes("friendIds")) issues.push("doesn't filter out friends");

  return { name: "Self-Filtering", pass: issues.length === 0, issues };
}

// ─── EVAL 7: Activity Types ──────────────────────────────────
function evalActivityTypes(): EvalResult {
  const issues: string[] = [];
  const content = readFile("src/components/social/ActivityFeed.tsx");

  for (const type of ["check_in", "match_complete", "new_player", "scheduled_game"]) {
    if (!content.includes(type)) issues.push(`activity type "${type}" not handled`);
  }
  if (!content.includes("timeAgo") && !content.includes("ago")) issues.push("no relative time formatting");

  return { name: "Activity Types", pass: issues.length === 0, issues };
}

// ─── EVAL 8: Empty States ─────────────────────────────────────
function evalEmptyStates(): EvalResult {
  const issues: string[] = [];
  const components: Record<string, string> = {
    ActivityFeed: "src/components/social/ActivityFeed.tsx",
    FriendRequests: "src/components/social/FriendRequests.tsx",
    PlayerSearch: "src/components/social/PlayerSearch.tsx",
  };

  for (const [name, filePath] of Object.entries(components)) {
    const content = readFile(filePath);
    if (!content.includes("length === 0") && !content.includes(".length < ") && !content.includes("No ")) {
      issues.push(`no empty state in ${name}`);
    }
  }

  return { name: "Empty States", pass: issues.length === 0, issues };
}

// ─── EVAL 9: Touch Targets ───────────────────────────────────
function evalTouchTargets(): EvalResult {
  const issues: string[] = [];
  const search = readFile("src/components/social/PlayerSearch.tsx");
  if (!search.includes("min-h-[44px]") && !search.includes("h-11") && !search.includes("py-3")) {
    issues.push("search input may not meet 44px touch target");
  }

  return { name: "Touch Targets", pass: issues.length === 0, issues };
}

// ─── EVAL 10: Activity Logging ────────────────────────────────
function evalActivityLogging(): EvalResult {
  const issues: string[] = [];
  const content = readFile("src/app/api/friends/respond/route.ts");

  if (!content.includes("activity_feed")) issues.push("friend accept not logged");
  if (!content.includes("friend_accepted")) issues.push("missing friend_accepted type");

  return { name: "Activity Logging", pass: issues.length === 0, issues };
}

// ─── EVAL 11: Self-Request Prevention ─────────────────────────
function evalSelfRequestPrevention(): EvalResult {
  const issues: string[] = [];
  const content = readFile("src/app/api/friends/route.ts");

  if (!content.includes("playerId") || !content.includes("friend_id")) {
    issues.push("can't verify self-request check");
  }
  // Check if there's an explicit self-request guard
  if (!content.includes("=== friend_id") && !content.includes("=== blocked_id")) {
    issues.push("no explicit self-request prevention (relies on DB constraint)");
  }

  return { name: "Self-Request Prevention", pass: issues.length === 0, issues };
}

// ─── EVAL 12: Loading States ──────────────────────────────────
function evalLoadingStates(): EvalResult {
  const issues: string[] = [];
  const search = readFile("src/components/social/PlayerSearch.tsx");

  if (!search.includes("loading") && !search.includes("Loader")) {
    issues.push("PlayerSearch has no loading indicator");
  }
  if (!search.includes("animate-spin") && !search.includes("Loading")) {
    issues.push("no visual loading spinner");
  }

  return { name: "Loading States", pass: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════
// RUNNER
// ═══════════════════════════════════════════════════════════════
const evals = [
  evalProfileValidation,
  evalSearchSanitization,
  evalFriendRequestAuth,
  evalGalleryValidation,
  evalSearchDebounce,
  evalSelfFiltering,
  evalActivityTypes,
  evalEmptyStates,
  evalTouchTargets,
  evalActivityLogging,
  evalSelfRequestPrevention,
  evalLoadingStates,
];

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║  AUTORESEARCH: Player Features Eval Scorecard       ║");
console.log("╠══════════════════════════════════════════════════════╣\n");

let passed = 0;
const allIssues: string[] = [];

for (const evalFn of evals) {
  const result = evalFn();
  const icon = result.pass ? "✅" : "❌";
  console.log(`  ${icon} ${result.name}`);
  if (!result.pass) {
    for (const issue of result.issues) {
      console.log(`     └─ ${issue}`);
      allIssues.push(`[${result.name}] ${issue}`);
    }
  }
  if (result.pass) passed++;
}

const total = evals.length;
const score = Math.round((passed / total) * 100);

console.log(`\n╠══════════════════════════════════════════════════════╣`);
console.log(`║  Score: ${passed}/${total} (${score}%)${" ".repeat(38 - `${passed}/${total} (${score}%)`.length)}║`);
console.log(`╚══════════════════════════════════════════════════════╝\n`);

if (allIssues.length > 0) {
  console.log("Issues to fix in next iteration:");
  allIssues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
}

// Write results to JSON for tracking
const resultData = {
  timestamp: new Date().toISOString(),
  iteration: 1,
  score,
  passed,
  total,
  issues: allIssues,
};

fs.writeFileSync(
  path.join(__dirname, "results.json"),
  JSON.stringify(resultData, null, 2)
);

process.exit(allIssues.length > 0 ? 1 : 0);
