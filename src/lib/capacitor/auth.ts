import type { SupabaseClient } from "@supabase/supabase-js";

export function isCapacitor(): boolean {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor;
  if (!cap) return false;
  if (typeof cap.isNativePlatform === "function") return cap.isNativePlatform();
  return cap.isNative === true;
}

/**
 * Detect if we're inside ANY embedded WebView (Capacitor, Cordova, etc.)
 * by checking the user-agent. WKWebView UA omits "Safari/" which real
 * Safari always includes.
 */
function isEmbeddedWebView(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /AppleWebKit/.test(ua) && !/Safari\//.test(ua);
}

/**
 * Open an OAuth flow in the system browser instead of the WebView.
 *
 * Why: Google blocks OAuth inside embedded WebViews, and even if it worked,
 * the WKWebView and SFSafariViewController have separate cookie jars which
 * breaks the OAuth state verification.
 *
 * This function always uses `skipBrowserRedirect: true` so no cookies are
 * set in the WebView. The entire flow happens in the system browser. After
 * auth, Supabase redirects to /auth/native-callback which uses JavaScript
 * to redirect to the lawnbowl:// deep link, handing control back to the app.
 */
export async function openOAuthInSystemBrowser(
  supabase: SupabaseClient,
  provider: "google" | "apple",
  nextPath: string = "/board"
): Promise<string | null> {
  const trampolineUrl =
    `${window.location.origin}/auth/native-callback?next=${encodeURIComponent(nextPath)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      skipBrowserRedirect: true,
      redirectTo: trampolineUrl,
    },
  });

  if (error) return error.message;
  if (!data?.url) return "No auth URL returned";

  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: data.url, presentationStyle: "popover" });
  } catch {
    window.open(data.url, "_blank");
  }
  return null;
}

/**
 * Returns true when social OAuth must go through the system browser.
 * This covers Capacitor apps AND any other embedded WebView scenario.
 */
export function needsSystemBrowserOAuth(): boolean {
  return isCapacitor() || isEmbeddedWebView();
}
