"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, Mail, User, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

function friendlySignupError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "An account with this phone/email already exists. Please sign in instead.";
  }
  if (lower.includes("password") && lower.includes("least")) {
    return "Password must be at least 6 characters long.";
  }
  if (lower.includes("valid email") || lower.includes("invalid email")) {
    return "Please enter a valid email address.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Unable to connect. Please check your internet connection and try again.";
  }
  return raw;
}

/** Common country codes */
const COUNTRY_CODES = [
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+61", label: "AU +61" },
  { code: "+64", label: "NZ +64" },
  { code: "+27", label: "ZA +27" },
  { code: "+852", label: "HK +852" },
];

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#FEFCF9" }}>
          <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const returnTo = searchParams.get("returnTo") || "/";

  function resetOtp() {
    setOtpSent(false);
    setOtp("");
    setSuccess(null);
    setError(null);
  }

  async function handlePhoneSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    const fullPhone = `${countryCode}${phone.replace(/\D/g, "")}`;

    if (!otpSent) {
      try {
        // TODO: Supabase phone auth must be enabled in the dashboard for this to work.
        // If not configured, users should use the email tab as fallback.
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: fullPhone,
          options: {
            data: { name },
          },
        });

        if (otpError) {
          const msg = otpError.message.toLowerCase();
          if (msg.includes("phone") || msg.includes("sms") || msg.includes("provider") || msg.includes("not enabled")) {
            setMode("email");
            setError(null);
            setSuccess("Phone sign-up is not available yet. Please use email instead.");
            setLoading(false);
            return;
          }
          setError(friendlySignupError(otpError.message));
          setLoading(false);
          return;
        }

        setOtpSent(true);
        setSuccess("We sent a code to your phone. Enter it below.");
        setLoading(false);
      } catch (err) {
        setError(friendlySignupError(err instanceof Error ? err.message : "Something went wrong."));
        setLoading(false);
      }
    } else {
      try {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          phone: fullPhone,
          token: otp,
          type: "sms",
        });

        if (verifyError) {
          setError(friendlySignupError(verifyError.message));
          setLoading(false);
          return;
        }

        // Create player profile
        if (data.user) {
          await supabase.from("players").insert({
            user_id: data.user.id,
            display_name: name,
          });
        }

        router.push("/onboarding/player");
        router.refresh();
      } catch (err) {
        setError(friendlySignupError(err instanceof Error ? err.message : "Something went wrong."));
        setLoading(false);
      }
    }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
          data: { name },
        },
      });

      if (signUpError) {
        setError(friendlySignupError(signUpError.message));
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setSuccess("Check your email for a sign-in link or code.");
      setLoading(false);
    } catch (err) {
      setError(
        friendlySignupError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      );
      setLoading(false);
    }
  }

  async function handleEmailOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (verifyError) {
        setError(friendlySignupError(verifyError.message));
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from("players").insert({
          user_id: data.user.id,
          display_name: name,
        });
      }

      router.push("/onboarding/player");
      router.refresh();
    } catch (err) {
      setError(friendlySignupError(err instanceof Error ? err.message : "Something went wrong."));
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "apple") {
    setError(null);
    try {
      const { error: socialError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
        },
      });
      if (socialError) {
        setError(friendlySignupError(socialError.message));
      }
    } catch (err) {
      setError(friendlySignupError(err instanceof Error ? err.message : "Something went wrong."));
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFCF9" }}>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <Image
              src="/images/logo/bowls-icon.png"
              alt="Lawnbowling"
              width={40}
              height={40}
            />
            <span className="text-xl font-bold" style={{ color: "#0A2E12" }}>
              Lawnbowling
            </span>
          </div>

          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
              >
                Join your local bowling club
              </h1>
              <p className="mt-3 text-base" style={{ color: "#3D5A3E" }}>
                Create your free account in seconds
              </p>
            </div>

            {/* Name field (always visible) */}
            <div className="mb-5">
              <label
                htmlFor="name"
                className="mb-2 block text-base font-medium"
                style={{ color: "#0A2E12" }}
              >
                Your Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block h-14 w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 pl-11 pr-4 text-lg shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                  style={{ color: "#0A2E12" }}
                  placeholder="Your name"
                />
              </div>
            </div>

            {/* Phone / Email mode toggle */}
            <div className="mb-5 flex rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] p-1">
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
                Phone
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

            {/* Phone signup */}
            {mode === "phone" && (
              <form onSubmit={handlePhoneSignup} className="space-y-5">
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
                        className="h-14 w-[100px] shrink-0 rounded-xl border border-[#0A2E12]/10 bg-white px-2 text-base shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
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
                      We&apos;ll text you a code. No password needed.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="signup-otp"
                      className="mb-2 block text-base font-medium"
                      style={{ color: "#0A2E12" }}
                    >
                      Enter Code
                    </label>
                    <input
                      id="signup-otp"
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

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-base text-red-700 shadow-sm" role="alert">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-base text-blue-700 shadow-sm" role="status">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (!!success && !otpSent)}
                  className="w-full rounded-xl py-4 text-lg font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-50 active:scale-[0.98]"
                  style={{ backgroundColor: "#1B5E20" }}
                >
                  {loading ? "Please wait..." : otpSent ? "Verify Code" : "Send Code"}
                </button>
              </form>
            )}

            {/* Email signup */}
            {mode === "email" && (
              <form onSubmit={otpSent ? handleEmailOtpVerify : handleEmailSignup} className="space-y-5">
                {!otpSent ? (
                  <div>
                    <label
                      htmlFor="signup-email"
                      className="mb-2 block text-base font-medium"
                      style={{ color: "#0A2E12" }}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                      <input
                        id="signup-email"
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
                      We&apos;ll send a sign-in link. No password needed.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="signup-email-otp"
                      className="mb-2 block text-base font-medium"
                      style={{ color: "#0A2E12" }}
                    >
                      Enter Code (or check email for link)
                    </label>
                    <input
                      id="signup-email-otp"
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

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-base text-red-700 shadow-sm" role="alert">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-base text-blue-700 shadow-sm" role="status">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (!!success && !otpSent)}
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
              Already have an account?{" "}
              <Link
                href={returnTo !== "/" ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login"}
                className="font-semibold underline"
                style={{ color: "#1B5E20" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
