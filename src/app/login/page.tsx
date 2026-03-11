"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleDot, Mail, Lock, Trophy, Users, MapPin, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const returnTo = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("returnTo") || "/"
    : "/";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(returnTo);
    router.refresh();
  }

  async function handleMagicLink() {
    if (!email) {
      setError("Enter your email first");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMagicLinkSent(true);
    setLoading(false);
  }

  const features = [
    {
      icon: Zap,
      title: "Live Scoring",
      desc: "Real-time score entry per end",
    },
    {
      icon: Users,
      title: "Draw Engine",
      desc: "Automatic team assignments",
    },
    {
      icon: MapPin,
      title: "Club Directory",
      desc: "Find clubs across the nation",
    },
    {
      icon: Trophy,
      title: "Tournaments",
      desc: "Multi-round competition manager",
    },
  ];

  if (magicLinkSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FEFCF9] px-4">
        <div className="w-full max-w-sm space-y-6 rounded-2xl border border-[#1B5E20]/10 bg-white p-8 text-center shadow-lg shadow-[#1B5E20]/5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20]/10">
            <Mail className="h-8 w-8 text-[#1B5E20]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
            Check your email
          </h1>
          <p className="text-[#3D5A3E]">
            We sent a magic link to <strong className="text-[#0A2E12]">{email}</strong>
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="text-sm font-medium text-[#1B5E20] hover:text-[#2E7D32]"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        {/* Left: Brand panel with dark forest green */}
        <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-[#0A2E12] px-6 py-12 lg:px-16 lg:py-0">
          {/* Subtle gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1B5E20]/20 via-transparent to-[#B8860B]/10" />

          <div className="relative mx-auto w-full max-w-lg">
            {/* Logo */}
            <Link href="/" className="mb-10 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E20]">
                <CircleDot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
                Lawnbowling
              </span>
            </Link>

            {/* Headline */}
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
              Where friendships{" "}
              <span className="italic text-[#A8D5BA]">roll.</span>
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-[#A8D5BA]/80">
              Tournament management, live scoring, and club directory for lawn bowlers across the nation.
            </p>

            {/* Feature Cards */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B5E20]">
                    <f.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                    <p className="mt-0.5 text-xs text-[#A8D5BA]/70">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
          <div className="w-full max-w-md rounded-2xl border border-[#0A2E12]/5 bg-white p-8 shadow-lg shadow-[#1B5E20]/5">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-[#3D5A3E]">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0A2E12]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]/50" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] py-3 pl-10 pr-3 text-[#0A2E12] placeholder-[#3D5A3E]/40 shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#0A2E12]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]/50" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] py-3 pl-10 pr-3 text-[#0A2E12] placeholder-[#3D5A3E]/40 shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    placeholder="Your password"
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
                className="w-full rounded-full bg-[#1B5E20] py-3 text-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/20 transition-all hover:bg-[#2E7D32] hover:shadow-xl hover:shadow-[#1B5E20]/25 disabled:opacity-50 active:scale-[0.97]"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#0A2E12]/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-[#3D5A3E]/60">or</span>
              </div>
            </div>

            <button
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full rounded-full border border-[#0A2E12]/10 bg-[#FEFCF9] py-3 text-sm font-semibold text-[#0A2E12] shadow-sm transition hover:border-[#1B5E20]/20 hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                Send Magic Link
              </span>
            </button>

            <p className="mt-6 text-center text-sm text-[#3D5A3E]">
              No account?{" "}
              <Link href={returnTo !== "/" ? `/signup?returnTo=${encodeURIComponent(returnTo)}` : "/signup"} className="font-medium text-[#1B5E20] hover:text-[#2E7D32]">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
