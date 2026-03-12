"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, User } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const returnTo = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("returnTo") || "/"
    : "/";

  async function handleMagicLinkSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { name },
      },
    });

    if (otpError) {
      setError(otpError.message);
      setLoading(false);
      return;
    }

    setConfirmationSent(true);
    setLoading(false);
  }

  async function handlePasswordSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { name },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is required
    if (data.user && !data.session) {
      setConfirmationSent(true);
      setLoading(false);
      return;
    }

    // Auto-confirmed — create player profile
    if (data.user && data.session) {
      await supabase.from("players").insert({
        user_id: data.user.id,
        display_name: name,
      });
      router.push("/onboarding/player");
      router.refresh();
    }
  }

  if (confirmationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "#FEFCF9" }}>
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-[#0A2E12]/10 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "#F0FFF4" }}>
            <Mail className="h-10 w-10" style={{ color: "#1B5E20" }} />
          </div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
          >
            Check your email
          </h1>
          <p className="text-lg" style={{ color: "#3D5A3E" }}>
            We sent a sign-in link to{" "}
            <strong style={{ color: "#0A2E12" }}>{email}</strong>.
          </p>
          <p className="text-base" style={{ color: "#3D5A3E" }}>
            Open your email and click the link to finish signing up. It may take a minute to arrive.
          </p>
          <Link href="/login">
            <button
              className="mt-4 rounded-xl px-6 py-4 text-lg font-semibold text-white transition hover:brightness-110"
              style={{ backgroundColor: "#1B5E20" }}
            >
              Back to sign in
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFCF9" }}>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <Image
              src="/images/logo/lawn-bowl-illustrated-icon.png"
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
                Create your free account in just a few steps
              </p>
            </div>

            {/* Magic link signup (default, no password needed) */}
            {!usePassword && (
              <form onSubmit={handleMagicLinkSignup} className="space-y-5">
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

                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-4 text-base text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-4 text-lg font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-50 active:scale-[0.98]"
                  style={{ backgroundColor: "#1B5E20" }}
                >
                  {loading ? "Sending sign-in link..." : "Email me a sign-in link"}
                </button>

                <p className="text-center text-base" style={{ color: "#3D5A3E" }}>
                  No password needed -- we will email you a link to sign in.
                </p>
              </form>
            )}

            {/* Password signup (optional, expandable) */}
            {usePassword && (
              <form onSubmit={handlePasswordSignup} className="space-y-5">
                <div>
                  <label
                    htmlFor="name-pw"
                    className="mb-2 block text-base font-medium"
                    style={{ color: "#0A2E12" }}
                  >
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                    <input
                      id="name-pw"
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
                    htmlFor="email-pw"
                    className="mb-2 block text-base font-medium"
                    style={{ color: "#0A2E12" }}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: "#3D5A3E" }} />
                    <input
                      id="email-pw"
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
                  <div className="rounded-lg bg-red-50 px-4 py-4 text-base text-red-700">
                    {error}
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
            )}

            {/* Toggle between magic link and password */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#0A2E12]/10" />
              </div>
              <div className="relative flex justify-center text-base">
                <span className="bg-white px-3" style={{ color: "#3D5A3E" }}>or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setUsePassword(!usePassword); setError(null); }}
              className="w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 text-lg font-semibold shadow-sm transition hover:bg-[#F0FFF4] active:scale-[0.98]"
              style={{ color: "#1B5E20" }}
            >
              {usePassword ? "Sign up with email link instead" : "Sign up with a password instead"}
            </button>

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
