"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, AlertTriangle, Loader2 } from "lucide-react";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

/**
 * Map Supabase error messages to user-friendly text.
 * Supabase returns terse developer-facing strings; we translate them here
 * so users see something helpful instead of cryptic API errors.
 */
function friendlyError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
    return "Invalid credentials. Please check and try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Your email is not confirmed yet. Please check your inbox for a confirmation link.";
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


export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-3" style={{ backgroundColor: "#FEFCF9" }}>
          <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
          <span className="text-sm font-medium text-[#1B5E20]">Loading…</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
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

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (!otpSent) {
      // Send magic link / OTP to email
      try {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
          },
        });

        if (otpError) {
          setError(friendlyError(otpError.message));
          setLoading(false);
          return;
        }

        setOtpSent(true);
        setInfo("Check your email for a sign-in link or code.");
        setLoading(false);
      } catch (err) {
        setError(friendlyError(err instanceof Error ? err.message : "Something went wrong."));
        setLoading(false);
      }
    } else {
      // Verify email OTP
      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: "email",
        });

        if (verifyError) {
          setError(friendlyError(verifyError.message));
          setLoading(false);
          return;
        }

        router.push(returnTo);
        router.refresh();
      } catch (err) {
        setError(friendlyError(err instanceof Error ? err.message : "Something went wrong."));
        setLoading(false);
      }
    }
  }

  async function handleSocialLogin(provider: "google" | "apple") {
    setError(null);
    try {
      const { error: socialError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
        },
      });
      if (socialError) {
        setError(friendlyError(socialError.message));
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : "Something went wrong."));
    }
  }

  function resetOtp() {
    setOtpSent(false);
    setOtp("");
    setInfo(null);
    setError(null);
  }

  const formRef = useRef<HTMLDivElement>(null);

  // Staggered entrance animation
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    const t = setTimeout(() => {
      el.style.transition = "opacity 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Full-screen background image with Ken Burns */}
      <div className="absolute inset-0">
        <Image
          src="/images/scenery-golden-hour-green.jpg"
          alt="Lawn bowling green at golden hour"
          fill
          priority
          className="object-cover login-ken-burns"
        />
        {/* Multi-layer gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2E12]/95 via-[#0A2E12]/50 to-[#0A2E12]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2E12]/40 to-transparent" />
        {/* Soft vignette */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,46,18,0.5) 100%)" }} />
      </div>

      {/* Brand top-left */}
      <div className="absolute left-6 top-6 z-20 flex items-center gap-3 sm:left-8 sm:top-8">
        <Image
          src={bowlsIconImg}
          alt="Lawnbowling"
          width={40}
          height={40}
          className="rounded-full shadow-lg"
        />
        <span className="text-xl font-bold text-white drop-shadow-md">
          Lawnbowling
        </span>
      </div>

      {/* Bottom quote */}
      <p className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-sm text-white/40 hidden sm:block">
        &ldquo;The best game you can play is the next one.&rdquo;
      </p>

      {/* Glassmorphic login card */}
      <div ref={formRef} className="relative z-10 mx-4 w-full max-w-md">
        {/* Headline above card */}
        <div className="mb-6 text-center sm:mb-8">
          <h1
            className="text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome Back
            <br />
            <span className="text-[#A8D5BA]">to the Green</span>
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/70 sm:text-lg">
            Sign in to check scores, enter tournaments, and connect with your club.
          </p>
        </div>

        <div className="login-glass rounded-2xl p-6 sm:rounded-3xl sm:p-8">
          <div className="w-full">
            <div className="mb-6">
              <h2
                className="text-2xl font-bold text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Sign In
              </h2>
              <p className="mt-1.5 text-sm text-white/60">
                Good to see you again
              </p>
            </div>

            {/* Email sign-in form (magic link, no password) */}
            <form onSubmit={handleEmailSignIn} className="space-y-5">
                {!otpSent ? (
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-base font-medium text-white/90"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block h-14 w-full rounded-xl border border-white/20 bg-white/10 py-4 pl-11 pr-4 text-lg text-white placeholder:text-white/60 shadow-sm backdrop-blur-sm transition focus:border-[#A8D5BA] focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]/30"
                        placeholder="you@example.com"
                      />
                    </div>
                    <p className="mt-2 text-sm text-white/50">
                      We&apos;ll send a sign-in link to your email. No password needed.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="email-otp"
                      className="mb-2 block text-base font-medium text-white/90"
                    >
                      Enter Code (or check email for link)
                    </label>
                    <input
                      id="email-otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      className="block h-14 w-full rounded-xl border border-white/20 bg-white/10 py-4 px-4 text-center text-2xl font-bold tracking-[0.3em] text-white placeholder:text-white/60 shadow-sm backdrop-blur-sm transition focus:border-[#A8D5BA] focus:outline-none focus:ring-2 focus:ring-[#A8D5BA]/30"
                      placeholder="000000"
                    />
                    <button
                      type="button"
                      onClick={resetOtp}
                      className="mt-2 text-sm font-medium text-[#A8D5BA] hover:text-white hover:underline transition"
                    >
                      Use a different email
                    </button>
                  </div>
                )}

                {info && (
                  <div
                    className="flex items-start gap-3 rounded-xl border border-blue-400/30 bg-blue-500/15 px-4 py-4 text-base text-blue-200 shadow-sm backdrop-blur-sm"
                    role="status"
                  >
                    <span>{info}</span>
                  </div>
                )}

                {error && (
                  <div
                    className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-4 text-base text-red-200 shadow-sm backdrop-blur-sm"
                    role="alert"
                  >
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="login-cta-btn w-full rounded-xl py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:brightness-110 disabled:opacity-50 active:scale-[0.97]"
                >
                  {loading ? "Please wait..." : otpSent ? "Verify Code" : "Send Sign-In Link"}
                </button>
              </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 border-t border-white/15" />
              <span className="text-sm font-medium text-white/50">or continue with</span>
              <div className="flex-1 border-t border-white/15" />
            </div>

            {/* Social login buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 text-base font-medium text-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white/20 active:scale-[0.97]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("apple")}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 text-base font-medium text-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white/20 active:scale-[0.97]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </button>
            </div>

            <p className="mt-6 text-center text-base text-white/60">
              No account yet?{" "}
              <Link
                href={returnTo !== "/board" ? `/signup?returnTo=${encodeURIComponent(returnTo)}` : "/signup"}
                className="font-semibold text-[#A8D5BA] hover:text-white underline transition"
              >
                Sign up free
              </Link>
            </p>

            <p className="mt-3 text-center text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-white/50 hover:text-white/80 hover:underline transition"
              >
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
