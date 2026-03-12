#!/usr/bin/env node
/**
 * Ensure Supabase Storage buckets exist for player avatars and game gallery.
 *
 * Buckets are created via the Storage Admin API using the service role key.
 * Safe to run multiple times — existing buckets are updated (upsert).
 *
 * Usage:
 *   node scripts/setup-storage-buckets.mjs
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const BUCKETS = [
  {
    id: "player-avatars",
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  {
    id: "game-gallery",
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
];

async function ensureBuckets() {
  const { data: existing, error: listErr } =
    await supabase.storage.listBuckets();
  if (listErr) {
    console.error("Failed to list buckets:", listErr.message);
    process.exit(1);
  }

  const existingIds = new Set(existing.map((b) => b.id));

  for (const bucket of BUCKETS) {
    if (existingIds.has(bucket.id)) {
      const { error } = await supabase.storage.updateBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      });
      if (error) {
        console.error(`Failed to update bucket "${bucket.id}":`, error.message);
      } else {
        console.log(`✓ Bucket "${bucket.id}" updated`);
      }
    } else {
      const { error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      });
      if (error) {
        console.error(
          `Failed to create bucket "${bucket.id}":`,
          error.message
        );
      } else {
        console.log(`✓ Bucket "${bucket.id}" created`);
      }
    }
  }

  // Verify
  const { data: final } = await supabase.storage.listBuckets();
  console.log(
    "\nBuckets:",
    final.map((b) => `${b.id} (public=${b.public})`)
  );
}

ensureBuckets().catch((err) => {
  console.error(err);
  process.exit(1);
});
