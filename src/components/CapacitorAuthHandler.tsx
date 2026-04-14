"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { needsSystemBrowserOAuth } from "@/lib/capacitor/auth";

function debugLog(msg: string) {
  try {
    const key = "lb-debug-log";
    const prev = localStorage.getItem(key) || "";
    const entry = new Date().toISOString().slice(11, 19) + " " + msg;
    const next = (prev + "\n" + entry).split("\n").slice(-20).join("\n");
    localStorage.setItem(key, next);
    // eslint-disable-next-line no-console
    console.log("[lb-debug]", entry);
  } catch {
    /* no-op */
  }
}

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

    debugLog("mount path=" + window.location.pathname);

    const supabase = createClient();

    let authSub: { subscription: { unsubscribe: () => void } } | null = null;

    // On mount: try to restore a session from Capacitor Preferences (native
    // UserDefaults) so it survives app kill + WKWebView data loss.
    (async () => {
      try {
        const { Preferences } = await import("@capacitor/preferences");

        // Subscribe to Supabase auth state changes so we mirror the session
        // into Preferences on every sign-in / refresh / sign-out.
        const sub = supabase.auth.onAuthStateChange(async (_event, session) => {
          try {
            if (session?.access_token && session?.refresh_token) {
              await Preferences.set({
                key: SESSION_STORAGE_KEY,
                value: JSON.stringify({
                  access_token: session.access_token,
                  refresh_token: session.refresh_token,
                }),
              });
            } else {
              await Preferences.remove({ key: SESSION_STORAGE_KEY });
            }
          } catch {
            /* no-op */
          }
        });
        authSub = sub.data;

        const { data: current } = await supabase.auth.getSession();
        if (current.session) return;

        const { value: stored } = await Preferences.get({ key: SESSION_STORAGE_KEY });
        if (!stored) return;

        const parsed = JSON.parse(stored) as {
          access_token: string;
          refresh_token: string;
        };
        if (!parsed?.access_token || !parsed?.refresh_token) return;

        const { data: restored, error } = await supabase.auth.setSession({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        });

        if (error) {
          await Preferences.remove({ key: SESSION_STORAGE_KEY });
        } else if (restored?.user) {
          // Session restored — reload so the server sees the new cookies
          window.location.reload();
        }
      } catch {
        /* no-op */
      }
    })();

    let removed = false;

    async function setup() {
      const { App } = await import("@capacitor/app");
      const { Browser } = await import("@capacitor/browser");

      const handle = await App.addListener("appUrlOpen", async (event) => {
        debugLog("appUrlOpen url=" + event.url);

        let url: URL;
        try {
          url = new URL(event.url);
        } catch {
          debugLog("appUrlOpen URL parse fail");
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
          debugLog("no code in callback");
          router.replace("/login?error=auth");
          return;
        }

        debugLog("exchange start code=" + code.slice(0, 8));
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.user || !data.session) {
          debugLog("exchange FAIL: " + (error?.message || "no user"));
          router.replace("/login?error=auth");
          return;
        }
        debugLog("exchange OK user=" + data.user.email);

        // Write the session to native Preferences IMMEDIATELY, before any
        // navigation. Don't rely on onAuthStateChange — timing is unreliable
        // across the SFSafariViewController → deep link hand-off.
        try {
          const { Preferences: Prefs } = await import("@capacitor/preferences");
          await Prefs.set({
            key: SESSION_STORAGE_KEY,
            value: JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }),
          });
        } catch {
          /* no-op */
        }

        const { data: existing } = await supabase
          .from("players")
          .select("id, onboarding_completed")
          .eq("user_id", data.user.id)
          .maybeSingle();

        debugLog("player existing=" + JSON.stringify(existing));

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
          debugLog("navigate /onboarding/player (new)");
          window.location.assign("/onboarding/player");
          return;
        }

        if (!existing.onboarding_completed) {
          debugLog("navigate /onboarding/player (incomplete)");
          window.location.assign("/onboarding/player");
          return;
        }

        debugLog("navigate " + next);
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
