import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client using the service role key.
 * Use this for webhook handlers and background jobs that run
 * without a user session (bypasses RLS).
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
