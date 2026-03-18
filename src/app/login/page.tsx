"use client";

import { Suspense, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, AlertTriangle, Loader2 } from "lucide-react";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

/**
 * Map Supabase error messages to user-friendly text.
 * Supabase returns terse developer-facing strings; we translate them here
 * so users see something helpful instead of cryptic API errors.
 */
function friendlyError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
    return "Invalid credentials. Please check your phone number and try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Your account is not confirmed yet. Please check your inbox for a confirmation link.";
  }
  if (lower.includes("too many requests") || lower.includes("rate limit")) {
    return "Too many login attempts. Please wait a moment and try again.";
  }
  if (lower.includes("user not found") || lower.includes("no user found")) {
    return "No account found. Please sign up first.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Unable to connect. Please check your internet connection and try again.";
  }
  // Fallback — return the original message
  return raw;
}

const COUNTRY_CODES = [
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+61", label: "AU +61" },
  { code: "+64", label: "NZ +64" },
  { code: "+27", label: "ZA +27" },
  { code: "+91", label: "IN +91" },
];

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#FEFCF9" }}>
          <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const returnTo = searchParams.get("returnTo") || "/board";

  // Pick up error passed via query string (e.g. from auth/callback redirect)
  useEffect(() => {
    const qError = searchParams.get("error");
    if (qError === "auth") {
      setError("Authentication failed. Please sign in again.");
    } else if (qError) {
      setError(friendlyError(qError));
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, "")}`;

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (signInError) {
        setError(friendlyError(signInError.message));
        setLoading(false);
        return;
      }

      router.push(`/verify?phone=${encodeURIComponent(fullPhone)}&returnTo=${encodeURIComponent(returnTo)}`);
    } catch (err) {
      setError(
        friendlyError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      );
      setLoading(false);
    }
  }

  async function handleOAuthSignIn(provider: "google" | "apple") {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
      },
    });
    if (oauthError) {
      setError(friendlyError(oauthError.message));
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: "#FEFCF9" }}>
      <div className="w-full max-w-md">
        {/* Logo and tagline */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src={bowlsIconImg}
            alt="LawnBowl"
            width={64}
            height={64}
            className="rounded-full shadow-lg"
          />
          <h2
            className="mt-4 text-lg font-medium"
            style={{ color: "#3D5A3E" }}
          >
            Your Club. Your Green. Your Game.
          </h2>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              Sign In
            </h1>
            <p className="mt-2 text-base" style={{ color: "#3D5A3E" }}>
              Good to see you again
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-base font-medium"
                style={{ color: "#0A2E12" }}
              >
                Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="h-14 rounded-xl border border-[#0A2E12]/10 bg-white px-3 text-base shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 min-h-[44px]"
                  style={{ color: "#0A2E12" }}
                >
                  {COUNTRY_CODES.map((cc) => (
                    <option key={cc.code} value={cc.code}>
                      {cc.label}
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="block h-14 w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 pl-11 pr-4 text-lg shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 min-h-[44px]"
                    style={{ color: "#0A2E12" }}
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-base text-red-700 shadow-sm"
                role="alert"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#145218] disabled:opacity-50 active:scale-[0.98] min-h-[44px]"
            >
              {loading ? "Sending code..." : "Continue"}
            </button>
          </form>

          {/* OR divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#0A2E12]/10" />
            <span className="text-sm font-medium" style={{ color: "#3D5A3E" }}>OR</span>
            <div className="h-px flex-1 bg-[#0A2E12]/10" />
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#0A2E12]/10 bg-white px-6 py-3 text-sm font-bold transition hover:bg-[#FEFCF9] active:scale-[0.98] min-h-[44px]"
              style={{ color: "#0A2E12" }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignIn("apple")}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#0A2E12]/10 bg-white px-6 py-3 text-sm font-bold transition hover:bg-[#FEFCF9] active:scale-[0.98] min-h-[44px]"
              style={{ color: "#0A2E12" }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          <p className="mt-6 text-center text-base" style={{ color: "#3D5A3E" }}>
            Don&apos;t have an account?{" "}
            <Link
              href={returnTo !== "/board" ? `/signup?returnTo=${encodeURIComponent(returnTo)}` : "/signup"}
              className="font-semibold underline"
              style={{ color: "#1B5E20" }}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
