"use client";

import { Suspense, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, Mail, AlertTriangle, Loader2 } from "lucide-react";
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
  if (lower.includes("phone") && lower.includes("not")) {
    return "Phone sign-in is not available yet. Please use email below.";
  }
  // Fallback — return the original message
  return raw;
}

/** Common country codes for phone login */
const COUNTRY_CODES = [
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+61", label: "AU +61" },
  { code: "+64", label: "NZ +64" },
  { code: "+27", label: "ZA +27" },
  { code: "+852", label: "HK +852" },
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
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
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

  async function handlePhoneSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const fullPhone = `${countryCode}${phone.replace(/\D/g, "")}`;

    if (!otpSent) {
      // Step 1: Send OTP via SMS
      try {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: fullPhone,
        });

        if (otpError) {
          // TODO: If Supabase phone auth is not configured, fall back to email
          setError(friendlyError(otpError.message));
          setLoading(false);
          return;
        }

        setOtpSent(true);
        setInfo("We sent a code to your phone. Enter it below.");
        setLoading(false);
      } catch (err) {
        setError(friendlyError(err instanceof Error ? err.message : "Something went wrong."));
        setLoading(false);
      }
    } else {
      // Step 2: Verify OTP
      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          phone: fullPhone,
          token: otp,
          type: "sms",
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
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
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
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
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
              src={bowlsIconImg}
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
                src={bowlsIconImg}
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

            {/* Phone / Email mode toggle */}
            <div className="mb-6 flex rounded-xl border border-[#0A2E12]/10 bg-white p-1">
              <button
                type="button"
                onClick={() => { setMode("phone"); resetOtp(); }}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "phone"
                    ? "bg-[#1B5E20] text-white shadow-sm"
                    : "text-[#3D5A3E] hover:text-[#0A2E12]"
                }`}
              >
                <Phone className="mr-1.5 inline h-4 w-4" />
                Phone Number
              </button>
              <button
                type="button"
                onClick={() => { setMode("email"); resetOtp(); }}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "email"
                    ? "bg-[#1B5E20] text-white shadow-sm"
                    : "text-[#3D5A3E] hover:text-[#0A2E12]"
                }`}
              >
                <Mail className="mr-1.5 inline h-4 w-4" />
                Email
              </button>
            </div>

            {/* Phone sign-in form */}
            {mode === "phone" && (
              <form onSubmit={handlePhoneSignIn} className="space-y-5">
                {!otpSent ? (
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
                        className="h-14 rounded-xl border border-[#0A2E12]/10 bg-white px-3 text-base shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                        style={{ color: "#0A2E12" }}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="block h-14 w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 pl-11 pr-4 text-lg shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                          style={{ color: "#0A2E12" }}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-[#3D5A3E]">
                      We&apos;ll text you a code to sign in. No password needed.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="otp"
                      className="mb-2 block text-base font-medium"
                      style={{ color: "#0A2E12" }}
                    >
                      Enter Code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      className="block h-14 w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 px-4 text-center text-2xl font-bold tracking-[0.3em] shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                      style={{ color: "#0A2E12" }}
                      placeholder="000000"
                    />
                    <button
                      type="button"
                      onClick={resetOtp}
                      className="mt-2 text-sm font-medium text-[#1B5E20] hover:underline"
                    >
                      Use a different number
                    </button>
                  </div>
                )}

                {info && (
                  <div
                    className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-base text-blue-700 shadow-sm"
                    role="status"
                  >
                    <span>{info}</span>
                  </div>
                )}

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
                  {loading ? "Please wait..." : otpSent ? "Verify Code" : "Send Code"}
                </button>
              </form>
            )}

            {/* Email sign-in form (magic link, no password) */}
            {mode === "email" && (
              <form onSubmit={handleEmailSignIn} className="space-y-5">
                {!otpSent ? (
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
                    <p className="mt-2 text-sm text-[#3D5A3E]">
                      We&apos;ll send a sign-in link to your email. No password needed.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="email-otp"
                      className="mb-2 block text-base font-medium"
                      style={{ color: "#0A2E12" }}
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
                      className="block h-14 w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 px-4 text-center text-2xl font-bold tracking-[0.3em] shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                      style={{ color: "#0A2E12" }}
                      placeholder="000000"
                    />
                    <button
                      type="button"
                      onClick={resetOtp}
                      className="mt-2 text-sm font-medium text-[#1B5E20] hover:underline"
                    >
                      Use a different email
                    </button>
                  </div>
                )}

                {info && (
                  <div
                    className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-base text-blue-700 shadow-sm"
                    role="status"
                  >
                    <span>{info}</span>
                  </div>
                )}

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
                  {loading ? "Please wait..." : otpSent ? "Verify Code" : "Send Sign-In Link"}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 border-t border-[#0A2E12]/10" />
              <span className="text-sm font-medium text-[#3D5A3E]">or continue with</span>
              <div className="flex-1 border-t border-[#0A2E12]/10" />
            </div>

            {/* Social login buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border border-[#0A2E12]/10 bg-white text-base font-medium shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                style={{ color: "#0A2E12" }}
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
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border border-[#0A2E12]/10 bg-white text-base font-medium shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                style={{ color: "#0A2E12" }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </button>
            </div>

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
