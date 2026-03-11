"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CircleDot, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const returnTo = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("returnTo") || "/"
    : "/";

  async function handleSignup(e: React.FormEvent) {
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
      router.push(returnTo);
      router.refresh();
    }
  }

  if (confirmationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FEFCF9] px-4">
        <div className="w-full max-w-sm space-y-6 rounded-2xl border border-[#1B5E20]/10 bg-white dark:bg-[#1a3d28] p-8 text-center shadow-lg shadow-[#1B5E20]/5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20]/10">
            <Mail className="h-8 w-8 text-[#1B5E20]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
            Check your email
          </h1>
          <p className="text-[#3D5A3E]">
            We sent a confirmation link to{" "}
            <strong className="text-[#0A2E12]">{email}</strong>
          </p>
          <Link href="/login" className="inline-block text-sm font-medium text-[#1B5E20] hover:text-[#2E7D32]">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        {/* Left: Photo panel */}
        <div className="relative hidden lg:flex lg:flex-1 items-end overflow-hidden">
          <Image
            src="/images/community-group-laughter.jpg"
            alt="Lawn bowlers enjoying a game together"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2E12]/90 via-[#0A2E12]/40 to-[#0A2E12]/20" />

          <div className="relative z-10 w-full p-10 pb-14">
            <Link href="/" className="mb-8 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <CircleDot className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
                Lawnbowling
              </span>
            </Link>

            <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
              Join the{" "}
              <span className="italic text-[#A8D5BA]">green.</span>
            </h1>

            <p className="mt-3 max-w-sm text-base leading-relaxed text-white/70">
              Set up your free account and start managing tournaments, tracking scores, and connecting with your club.
            </p>
          </div>
        </div>

        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-[#1B5E20]/5 bg-[#FEFCF9] px-6 py-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B5E20]">
              <CircleDot className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
              Lawnbowling
            </span>
          </Link>
        </div>

        {/* Right: Signup Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 lg:max-w-xl lg:px-16">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
                Create your account
              </h2>
              <p className="mt-2 text-sm text-[#3D5A3E]">
                Join the green in seconds
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]/70">
                  Display Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]/40" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-[#0A2E12]/10 bg-white py-3 pl-10 pr-3 text-[#0A2E12] placeholder-[#3D5A3E]/30 transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]/70">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-[#0A2E12]/10 bg-white py-3 pl-10 pr-3 text-[#0A2E12] placeholder-[#3D5A3E]/30 transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]/70">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]/40" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="block w-full rounded-xl border border-[#0A2E12]/10 bg-white py-3 pl-10 pr-3 text-[#0A2E12] placeholder-[#3D5A3E]/30 transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#1B5E20] py-3 text-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/20 transition-all hover:bg-[#2E7D32] hover:shadow-xl hover:shadow-[#1B5E20]/25 disabled:opacity-50 active:scale-[0.97]"
              >
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#3D5A3E]">
              Already have an account?{" "}
              <Link href={returnTo !== "/" ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login"} className="font-semibold text-[#1B5E20] hover:text-[#2E7D32]">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
