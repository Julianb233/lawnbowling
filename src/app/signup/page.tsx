"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, User, Lock, AlertTriangle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

function friendlySignupError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "An account with this email already exists. Please sign in instead.";
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


export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-3" style={{ backgroundColor: "#FEFCF9" }}>
          <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
          <span className="text-sm font-medium text-[#1B5E20]">Loading…</span>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const returnTo = searchParams.get("returnTo") || "/";

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(friendlySignupError(signUpError.message));
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create player profile
        await supabase.from("players").insert({
          user_id: data.user.id,
          display_name: name,
        });
      }

      router.push("/onboarding/player");
      router.refresh();
    } catch (err) {
      setError(
        friendlySignupError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      );
      setLoading(false);
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

            {/* Signup form with email + password */}
            <form onSubmit={handleEmailSignup} className="space-y-5">
              {/* Name field */}
              <div>
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

              {/* Email field */}
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
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="signup-password"
                  className="mb-2 block text-base font-medium"
                  style={{ color: "#0A2E12" }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="block h-14 w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 pl-11 pr-12 text-lg shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    style={{ color: "#0A2E12" }}
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                    style={{ color: "#3D5A3E" }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field */}
              <div>
                <label
                  htmlFor="signup-confirm-password"
                  className="mb-2 block text-base font-medium"
                  style={{ color: "#0A2E12" }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                  <input
                    id="signup-confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="block h-14 w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 pl-11 pr-4 text-lg shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    style={{ color: "#0A2E12" }}
                    placeholder="Repeat your password"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-base text-red-700 shadow-sm" role="alert">
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
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 border-t border-[#0A2E12]/10" />
              <span className="text-sm font-medium text-[#3D5A3E]">or continue with</span>
              <div className="flex-1 border-t border-[#0A2E12]/10" />
            </div>

            {/* Social login buttons — disabled until OAuth is configured */}
            <div className="flex gap-3">
              <button
                type="button"
                disabled
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border border-[#0A2E12]/5 bg-gray-50 text-base font-medium shadow-sm cursor-not-allowed"
                style={{ color: "#0A2E12", opacity: 0.4 }}
                title="Google sign-in coming soon"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google <span className="text-xs">(soon)</span></span>
              </button>
              <button
                type="button"
                disabled
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border border-[#0A2E12]/5 bg-gray-50 text-base font-medium shadow-sm cursor-not-allowed"
                style={{ color: "#0A2E12", opacity: 0.4 }}
                title="Apple sign-in coming soon"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>Apple <span className="text-xs">(soon)</span></span>
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
