"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { needsSystemBrowserOAuth } from "@/lib/capacitor/auth";

/**
 * Listens for deep-link callbacks from the system browser after OAuth.
 * When the `lawnbowl://auth/callback?code=…` URL opens the app, this
 * component exchanges the PKCE code for a session client-side and
 * ensures the player profile row exists (mirroring the server-side
 * /auth/callback route logic).
 */
export function CapacitorAuthHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!needsSystemBrowserOAuth()) return;

    let removed = false;

    async function setup() {
      const { App } = await import("@capacitor/app");
      const { Browser } = await import("@capacitor/browser");

      const handle = await App.addListener("appUrlOpen", async (event) => {
        let url: URL;
        try {
          url = new URL(event.url);
        } catch {
          return;
        }

        // lawnbowl://auth/callback  →  host="auth", pathname="/callback"
        if (url.host !== "auth" || url.pathname !== "/callback") return;

        try {
          await Browser.close();
        } catch {
          /* may already be closed */
        }

        const code = url.searchParams.get("code");
        const next = url.searchParams.get("next") || "/board";

        if (!code) {
          alert("[CapacitorAuth] No code in deep link: " + event.url);
          router.replace("/login?error=auth");
          return;
        }

        const supabase = createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.user) {
          alert(
            "[CapacitorAuth] exchange failed:\n" +
              (error ? `${error.name}: ${error.message}` : "no user returned") +
              "\ncode=" + code.slice(0, 20) + "..."
          );
          router.replace("/login?error=auth");
          return;
        }

        const { data: existing } = await supabase
          .from("players")
          .select("id, onboarding_completed")
          .eq("user_id", data.user.id)
          .single();

        if (!existing) {
          await supabase.from("players").upsert({
            user_id: data.user.id,
            display_name:
              data.user.user_metadata?.name ||
              data.user.email?.split("@")[0] ||
              "Player",
            role: "player",
          }, { onConflict: "user_id" });
          router.replace("/onboarding/player");
          return;
        }

        if (!existing.onboarding_completed) {
          router.replace("/onboarding/player");
          return;
        }

        router.replace(next);
      });

      if (removed) handle.remove();
      return handle;
    }

    const handlePromise = setup();

    return () => {
      removed = true;
      handlePromise.then((h) => h?.remove());
    };
  }, [router]);

  return null;
}
