"use client";

import { Suspense, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, AlertTriangle, Loader2 } from "lucide-react";

/**
 * Map Supabase error messages to user-friendly text.
 * Supabase returns terse developer-facing strings; we translate them here
 * so users see something helpful instead of cryptic API errors.
 */
function friendlyError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
    return "Invalid email or password. Please check your credentials and try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Your email is not confirmed yet. Please check your inbox for a confirmation link.";
  }
  if (lower.includes("too many requests") || lower.includes("rate limit")) {
    return "Too many login attempts. Please wait a moment and try again.";
  }
  if (lower.includes("user not found") || lower.includes("no user found")) {
    return "No account found with that email address. Please sign up first.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Unable to connect. Please check your internet connection and try again.";
  }
  // Fallback — return the original message
  return raw;
}

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(friendlyError(signInError.message));
        setLoading(false);
        return;
      }

      router.push(returnTo);
      router.refresh();
    } catch (err) {
      setError(
        friendlyError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Full-bleed photo with overlay */}
      <div className="relative hidden lg:flex lg:w-[55%]">
        <Image
          src="/images/scenery-golden-hour-green.jpg"
          alt="Lawn bowling green at golden hour"
          fill
          priority
          className="object-cover"
        />
        {/* Dark green gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2E12]/80 via-[#0A2E12]/60 to-[#0A2E12]/40" />

        {/* Content over the image */}
        <div className="relative z-10 flex flex-col justify-between p-12">
          {/* Brand top-left */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo/bowls-icon.png"
              alt="Lawnbowling"
              width={40}
              height={40}
              className="rounded-full shadow-lg"
            />
            <span className="text-xl font-bold text-white">
              Lawnbowling
            </span>
          </div>

          {/* Headline centered */}
          <div className="max-w-md">
            <h1
              className="text-5xl font-extrabold leading-tight tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome Back
              <br />
              <span className="text-[#A8D5BA]">to the Green</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              Sign in to check scores, enter tournaments, and connect with your club.
            </p>
          </div>

          {/* Bottom quote */}
          <p className="text-sm text-white/50">
            &ldquo;The best game you can play is the next one.&rdquo;
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex flex-1 flex-col" style={{ backgroundColor: "#FEFCF9" }}>
        {/* Mobile header with background image */}
        <div className="relative lg:hidden">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src="/images/scenery-golden-hour-green.jpg"
              alt="Lawn bowling green"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A2E12]/60 to-[#0A2E12]/80" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center">
              <Image
                src="/images/logo/bowls-icon.png"
                alt="Lawnbowling"
                width={48}
                height={48}
                className="rounded-full shadow-lg"
              />
              <h1
                className="mt-3 text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Welcome Back
              </h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Desktop heading (hidden on mobile since it's in the hero) */}
            <div className="mb-8 hidden lg:block">
              <h2
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
              >
                Sign In
              </h2>
              <p className="mt-2 text-base" style={{ color: "#3D5A3E" }}>
                Good to see you again
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-base font-medium"
                  style={{ color: "#0A2E12" }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block h-14 w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 pl-11 pr-4 text-lg shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    style={{ color: "#0A2E12" }}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-base font-medium"
                  style={{ color: "#0A2E12" }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block h-14 w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 pl-11 pr-4 text-lg shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    style={{ color: "#0A2E12" }}
                    placeholder="Your password"
                  />
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
                className="w-full rounded-xl py-4 text-lg font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-50 active:scale-[0.98]"
                style={{ backgroundColor: "#1B5E20" }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-base" style={{ color: "#3D5A3E" }}>
              No account yet?{" "}
              <Link
                href={returnTo !== "/board" ? `/signup?returnTo=${encodeURIComponent(returnTo)}` : "/signup"}
                className="font-semibold underline"
                style={{ color: "#1B5E20" }}
              >
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
