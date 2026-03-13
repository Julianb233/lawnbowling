"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const returnTo = searchParams.get("returnTo") || "/";

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
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

      // If email confirmation is required
      if (data.user && !data.session) {
        setSuccess("Check your email for a confirmation link, then come back and sign in.");
        setLoading(false);
        return;
      }

      // Auto-confirmed — create player profile and go to onboarding
      if (data.user && data.session) {
        await supabase.from("players").insert({
          user_id: data.user.id,
          display_name: name,
        });
        router.push("/onboarding/player");
        router.refresh();
      }
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

            <form onSubmit={handleSignup} className="space-y-5">
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
                    minLength={6}
                    className="block h-14 w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 pl-11 pr-4 text-lg shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    style={{ color: "#0A2E12" }}
                    placeholder="At least 6 characters"
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

              {success && (
                <div
                  className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-base text-green-700 shadow-sm"
                  role="status"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span>{success}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full rounded-xl py-4 text-lg font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-50 active:scale-[0.98]"
                style={{ backgroundColor: "#1B5E20" }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

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
