#!/bin/bash
# Apply all pending migrations to production Supabase
# Uses the Management API for SQL execution
set -euo pipefail

PROJECT_REF="fcwlrvjnmzoszjwmbyfl"
API_URL="https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query"
MIGRATIONS_DIR="$(dirname "$0")/../supabase/migrations"

# Get the management API token from 1Password
MGMT_TOKEN=$(op item get "pnr4whtff2mgksuz7agpjoqmwq" --vault "API-Keys" --fields management_api_token --reveal 2>/dev/null)

if [ -z "$MGMT_TOKEN" ]; then
  echo "ERROR: Could not retrieve Supabase management API token from 1Password"
  exit 1
fi

# Migration files in dependency order
MIGRATIONS=(
  "20260312_is_own_player_function.sql"
  "20260312_missing_tables.sql"
  "20260312_player_preferred_hand.sql"
  "20260312_player_onboarding_fields.sql"
  "20260312_membership_tiers.sql"
  "20260312_notification_preferences.sql"
  "20260312_noticeboard_post_types.sql"
  "20260312_enable_rls_missing_tables.sql"
  "20260312_fix_club_events_rls.sql"
  "20260312_fix_visit_requests_rls.sql"
  "20260312_triggers.sql"
  "20260312_pg_cron_jobs.sql"
)

PASSED=0
FAILED=0
SKIPPED=0
RESULTS=""

run_sql() {
  local sql="$1"
  local escaped_sql
  escaped_sql=$(python3 -c "import json,sys; print(json.dumps(sys.stdin.read()))" <<< "$sql")

  local response
  response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Authorization: Bearer $MGMT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $escaped_sql}" 2>&1)

  local http_code
  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | head -n -1)

  if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
    echo "OK"
    return 0
  else
    echo "$body"
    return 1
  fi
}

echo "=========================================="
echo "Applying migrations to production Supabase"
echo "Project: ${PROJECT_REF}"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "=========================================="
echo ""

for migration in "${MIGRATIONS[@]}"; do
  filepath="${MIGRATIONS_DIR}/${migration}"

  if [ ! -f "$filepath" ]; then
    echo "SKIP: $migration (file not found)"
    SKIPPED=$((SKIPPED + 1))
    RESULTS="${RESULTS}\nSKIP: ${migration} - file not found"
    continue
  fi

  echo -n "Applying: $migration ... "
  sql=$(cat "$filepath")

  result=$(run_sql "$sql" 2>&1)

  if [ "$result" = "OK" ]; then
    echo "✓ SUCCESS"
    PASSED=$((PASSED + 1))
    RESULTS="${RESULTS}\nPASS: ${migration}"
  else
    echo "✗ FAILED"
    echo "  Error: $result"
    FAILED=$((FAILED + 1))
    RESULTS="${RESULTS}\nFAIL: ${migration} - ${result}"
  fi
done

echo ""
echo "=========================================="
echo "Migration Results Summary"
echo "=========================================="
echo "Passed:  $PASSED"
echo "Failed:  $FAILED"
echo "Skipped: $SKIPPED"
echo ""
echo -e "$RESULTS"
