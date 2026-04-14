"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { needsSystemBrowserOAuth } from "@/lib/capacitor/auth";

const SESSION_STORAGE_KEY = "lb-capacitor-session";

/**
 * Listens for deep-link callbacks from the system browser after OAuth
 * AND mirrors the Supabase session into localStorage so it survives
 * app kill/relaunch even when WKWebView drops cookies.
 */
export function CapacitorAuthHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!needsSystemBrowserOAuth()) return;

    const supabase = createClient();

    // On mount: try to restore a session from localStorage if the
    // cookie jar is empty (classic WKWebView cookie-drop scenario).
    (async () => {
      try {
        const { data: current } = await supabase.auth.getSession();
        if (current.session) return; // already have a session, nothing to restore

        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!stored) return;

        const parsed = JSON.parse(stored) as {
          access_token: string;
          refresh_token: string;
        };
        if (!parsed?.access_token || !parsed?.refresh_token) return;

        const { error } = await supabase.auth.setSession({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        });
        if (error) {
          // refresh token likely expired; clear it so we don't keep trying
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {
        /* no-op */
      }
    })();

    // Keep localStorage mirror in sync with every auth state change.
    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        if (session?.access_token && session?.refresh_token) {
          localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
          );
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {
        /* no-op */
      }
    });

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
          router.replace("/login?error=auth");
          return;
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.user) {
          router.replace("/login?error=auth");
          return;
        }

        const { data: existing } = await supabase
          .from("players")
          .select("id, onboarding_completed")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from("players").upsert(
            {
              user_id: data.user.id,
              display_name:
                data.user.user_metadata?.name ||
                data.user.email?.split("@")[0] ||
                "Player",
              role: "player",
            },
            { onConflict: "user_id" },
          );
          window.location.assign("/onboarding/player");
          return;
        }

        if (!existing.onboarding_completed) {
          window.location.assign("/onboarding/player");
          return;
        }

        window.location.assign(next);
      });

      if (removed) handle.remove();
      return handle;
    }

    const handlePromise = setup();

    return () => {
      removed = true;
      handlePromise.then((h) => h?.remove());
      authSub?.subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
