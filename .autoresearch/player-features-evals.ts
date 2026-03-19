/**
 * Autoresearch Evals for Player Features
 *
 * Binary evals that score player feature quality across multiple dimensions.
 * Each eval returns pass/fail — the optimization loop iterates until all pass.
 *
 * Dimensions:
 * 1. Code Quality — validation, error handling, edge cases
 * 2. UX Completeness — all states handled (empty, loading, error, populated)
 * 3. Security — auth guards, input sanitization, access control
 * 4. Performance — efficient queries, pagination, debouncing
 * 5. Accessibility — WCAG compliance, touch targets, keyboard nav
 */

// ═══════════════════════════════════════════════════════════════
// EVAL 1: Profile Validation Completeness
// ═══════════════════════════════════════════════════════════════
export function evalProfileValidation(): { pass: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check: display_name is trimmed and validated
  const profileRoute = require("fs").readFileSync(
    "src/app/api/profile/route.ts", "utf-8"
  );

  if (!profileRoute.includes(".trim()")) {
    issues.push("MISSING: display_name trimming");
  }
  if (!profileRoute.includes("display_name")) {
    issues.push("MISSING: display_name validation");
  }
  if (!profileRoute.includes("400")) {
    issues.push("MISSING: 400 error for invalid input");
  }
  if (!profileRoute.includes("409")) {
    issues.push("MISSING: 409 conflict for duplicate profiles");
  }
  if (!profileRoute.includes("bio") || !profileRoute.includes("500")) {
    issues.push("MISSING: bio truncation to 500 chars");
  }

  return { pass: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════
// EVAL 2: Search Input Sanitization
// ═══════════════════════════════════════════════════════════════
export function evalSearchSanitization(): { pass: boolean; issues: string[] } {
  const issues: string[] = [];
  const searchRoute = require("fs").readFileSync(
    "src/app/api/search/route.ts", "utf-8"
  );

  if (!searchRoute.includes(".trim()")) {
    issues.push("MISSING: query trimming");
  }
  if (!searchRoute.includes("length < 2") && !searchRoute.includes("length >= 2")) {
    issues.push("MISSING: minimum query length check");
  }
  if (!searchRoute.includes(".limit(")) {
    issues.push("MISSING: result limit to prevent data dumps");
  }
  if (!searchRoute.includes("ilike")) {
    issues.push("MISSING: case-insensitive search");
  }

  return { pass: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════
// EVAL 3: Friend Request Auth Guards
// ═══════════════════════════════════════════════════════════════
export function evalFriendRequestAuth(): { pass: boolean; issues: string[] } {
  const issues: string[] = [];
  const files = [
    "src/app/api/friends/route.ts",
    "src/app/api/friends/respond/route.ts",
    "src/app/api/friends/block/route.ts",
  ];

  for (const file of files) {
    const content = require("fs").readFileSync(file, "utf-8");
    if (!content.includes("getUser()")) {
      issues.push(`MISSING: auth check in ${file}`);
    }
    if (!content.includes("401")) {
      issues.push(`MISSING: 401 response in ${file}`);
    }
    if (!content.includes("getPlayerIdFromAuth") && !content.includes("getPlayerByUserId")) {
      issues.push(`MISSING: player ID resolution in ${file}`);
    }
  }

  return { pass: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════
// EVAL 4: Gallery Upload Validation
// ═══════════════════════════════════════════════════════════════
export function evalGalleryValidation(): { pass: boolean; issues: string[] } {
  const issues: string[] = [];
  const galleryRoute = require("fs").readFileSync(
    "src/app/api/profile/gallery/route.ts", "utf-8"
  );

  if (!galleryRoute.includes("MAX_PHOTOS") && !galleryRoute.includes("12")) {
    issues.push("MISSING: photo count limit");
  }
  if (!galleryRoute.includes("image/")) {
    issues.push("MISSING: file type validation");
  }
  if (!galleryRoute.includes("5 * 1024 * 1024") && !galleryRoute.includes("5MB")) {
    issues.push("MISSING: file size validation");
  }
  if (!galleryRoute.includes("formData")) {
    issues.push("MISSING: multipart form handling");
  }

  return { pass: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════
// EVAL 5: Search Debounce in UI
// ═══════════════════════════════════════════════════════════════
export function evalSearchDebounce(): { pass: boolean; issues: string[] } {
  const issues: string[] = [];
  const playerSearch = require("fs").readFileSync(
    "src/components/social/PlayerSearch.tsx", "utf-8"
  );

  if (!playerSearch.includes("setTimeout") && !playerSearch.includes("debounce")) {
    issues.push("MISSING: search debouncing");
  }
  if (!playerSearch.includes("300") && !playerSearch.includes("500")) {
    issues.push("MISSING: reasonable debounce delay (300-500ms)");
  }
  if (!playerSearch.includes("clearTimeout")) {
    issues.push("MISSING: debounce cleanup on new input");
  }

  return { pass: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════
// EVAL 6: Self-Filtering in Search Results
// ═══════════════════════════════════════════════════════════════
export function evalSelfFiltering(): { pass: boolean; issues: string[] } {
  const issues: string[] = [];
  const playerSearch = require("fs").readFileSync(
    "src/components/social/PlayerSearch.tsx", "utf-8"
  );

  if (!playerSearch.includes("currentPlayerId")) {
    issues.push("MISSING: filter out current player from results");
  }
  if (!playerSearch.includes("friendIds")) {
    issues.push("MISSING: filter out existing friends from results");
  }

  return { pass: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════
// EVAL 7: Activity Feed Types Coverage
// ═══════════════════════════════════════════════════════════════
export function evalActivityTypes(): { pass: boolean; issues: string[] } {
  const issues: string[] = [];
  const activityFeed = require("fs").readFileSync(
    "src/components/social/ActivityFeed.tsx", "utf-8"
  );

  const requiredTypes = ["check_in", "match_complete", "new_player", "scheduled_game"];
  for (const type of requiredTypes) {
    if (!activityFeed.includes(type)) {
      issues.push(`MISSING: activity type "${type}" not handled`);
    }
  }

  if (!activityFeed.includes("timeAgo") && !activityFeed.includes("ago")) {
    issues.push("MISSING: relative time formatting");
  }

  return { pass: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════
// EVAL 8: Empty States
// ═══════════════════════════════════════════════════════════════
export function evalEmptyStates(): { pass: boolean; issues: string[] } {
  const issues: string[] = [];

  const components = {
    "ActivityFeed": "src/components/social/ActivityFeed.tsx",
    "FriendRequests": "src/components/social/FriendRequests.tsx",
    "PlayerSearch": "src/components/social/PlayerSearch.tsx",
  };

  for (const [name, path] of Object.entries(components)) {
    const content = require("fs").readFileSync(path, "utf-8");
    if (!content.includes("length === 0") && !content.includes(".length < ") && !content.includes("No ")) {
      issues.push(`MISSING: empty state handling in ${name}`);
    }
  }

  return { pass: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════
// EVAL 9: Touch Target Compliance (44px minimum)
// ═══════════════════════════════════════════════════════════════
export function evalTouchTargets(): { pass: boolean; issues: string[] } {
  const issues: string[] = [];
  const playerSearch = require("fs").readFileSync(
    "src/components/social/PlayerSearch.tsx", "utf-8"
  );

  if (!playerSearch.includes("min-h-[44px]") && !playerSearch.includes("h-11") && !playerSearch.includes("py-3")) {
    issues.push("MISSING: 44px minimum touch target on search input");
  }

  const friendRequests = require("fs").readFileSync(
    "src/components/social/FriendRequests.tsx", "utf-8"
  );

  if (!friendRequests.includes("py-1.5") && !friendRequests.includes("min-h-[44px]")) {
    issues.push("WARNING: friend request buttons may be too small for elderly users");
  }

  return { pass: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════
// EVAL 10: Friend Request Activity Logging
// ═══════════════════════════════════════════════════════════════
export function evalFriendActivityLogging(): { pass: boolean; issues: string[] } {
  const issues: string[] = [];
  const respondRoute = require("fs").readFileSync(
    "src/app/api/friends/respond/route.ts", "utf-8"
  );

  if (!respondRoute.includes("activity_feed")) {
    issues.push("MISSING: friend accept not logged to activity feed");
  }
  if (!respondRoute.includes("friend_accepted")) {
    issues.push("MISSING: friend_accepted activity type");
  }

  return { pass: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════
// RUNNER — Execute all evals and produce scorecard
// ═══════════════════════════════════════════════════════════════
export function runAllEvals() {
  const evals = [
    { name: "Profile Validation", fn: evalProfileValidation },
    { name: "Search Sanitization", fn: evalSearchSanitization },
    { name: "Friend Request Auth", fn: evalFriendRequestAuth },
    { name: "Gallery Validation", fn: evalGalleryValidation },
    { name: "Search Debounce", fn: evalSearchDebounce },
    { name: "Self-Filtering", fn: evalSelfFiltering },
    { name: "Activity Types", fn: evalActivityTypes },
    { name: "Empty States", fn: evalEmptyStates },
    { name: "Touch Targets", fn: evalTouchTargets },
    { name: "Friend Activity Logging", fn: evalFriendActivityLogging },
  ];

  let passed = 0;
  const results: Array<{ name: string; pass: boolean; issues: string[] }> = [];

  for (const { name, fn } of evals) {
    try {
      const result = fn();
      results.push({ name, ...result });
      if (result.pass) passed++;
    } catch (e) {
      results.push({ name, pass: false, issues: [`ERROR: ${e}`] });
    }
  }

  return {
    total: evals.length,
    passed,
    failed: evals.length - passed,
    score: Math.round((passed / evals.length) * 100),
    results,
  };
}
