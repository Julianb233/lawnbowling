/**
 * Run the bowls_checkins migration against Supabase.
 *
 * Usage:
 *   npx tsx scripts/migration-bowls-checkins.ts
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

async function main() {
  console.log("Running bowls_checkins migration...\n");

  const sqlPath = resolve(__dirname, "..", "src/lib/db/migrations/006_bowls_checkins.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  // Execute the migration SQL via rpc
  const { error } = await supabase.rpc("exec_sql", { sql_text: sql });

  if (error) {
    // Fallback: try executing statements individually
    console.log("RPC exec_sql not available, executing statements individually...\n");

    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      console.log(`  Executing: ${stmt.slice(0, 60)}...`);
      const { error: stmtErr } = await supabase.rpc("exec_sql", { sql_text: stmt + ";" });
      if (stmtErr) {
        console.warn(`  Warning: ${stmtErr.message}`);
      }
    }
  }

  // Verify the table exists
  const { data, error: verifyErr } = await supabase
    .from("bowls_checkins")
    .select("id")
    .limit(1);

  if (verifyErr) {
    console.error("\nVerification failed:", verifyErr.message);
    console.log("\nThe migration SQL needs to be run manually via Supabase SQL Editor:");
    console.log(`  File: src/lib/db/migrations/006_bowls_checkins.sql`);
    process.exit(1);
  }

  console.log("\nbowls_checkins table verified successfully!");
  console.log(`  Rows: ${data?.length ?? 0}`);
}

main().catch((err) => {
  console.error("\nMigration failed:", err.message || err);
  process.exit(1);
});
