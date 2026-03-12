import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Create a Supabase client with the service role key.
 * Edge Functions run server-side with no user session,
 * so we use the service role to bypass RLS.
 */
export function createServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

/**
 * Create a Supabase client scoped to an authenticated user's JWT.
 * Useful when the Edge Function receives a user's access token.
 */
export function createUserClient(accessToken: string) {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    }
  );
}
