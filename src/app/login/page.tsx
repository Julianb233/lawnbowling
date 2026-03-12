"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trophy, MapPin, BarChart3, Users, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const returnTo = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("returnTo") || "/board"
    : "/board";

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

  const features = [
    {
      icon: Trophy,
      title: "Tournament Draws",
      desc: "Enter and track club tournaments",
      color: "#1B5E20",
      bg: "#F0FFF4",
    },
    {
      icon: BarChart3,
      title: "Live Scoring",
      desc: "Score games right from your phone",
      color: "#1B5E20",
      bg: "#F0FFF4",
    },
    {
      icon: MapPin,
      title: "Club Directory",
      desc: "Find clubs and members near you",
      color: "#1B5E20",
      bg: "#F0FFF4",
    },
    {
      icon: Users,
      title: "Your Stats",
      desc: "See your games, wins, and history",
      color: "#1B5E20",
      bg: "#F0FFF4",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFCF9" }}>
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        {/* Left: Hero / Features */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 lg:py-0">
          <div className="mx-auto w-full max-w-lg">
            {/* Brand */}
            <div className="mb-8 flex items-center gap-3">
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

            {/* Headline */}
            <h1
              className="text-4xl font-extrabold leading-tight tracking-tight lg:text-5xl"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              Welcome Back
              <br />
              <span style={{ color: "#1B5E20" }}>to the Green</span>
            </h1>

            <p className="mt-4 text-lg leading-relaxed" style={{ color: "#3D5A3E" }}>
              Sign in to check scores, enter tournaments, and connect with your club.
            </p>

            {/* Feature Cards */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 rounded-xl border border-[#0A2E12]/10 bg-white p-4"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: f.bg }}
                  >
                    <f.icon className="h-5 w-5" style={{ color: f.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: "#0A2E12" }}>
                      {f.title}
                    </h3>
                    <p className="mt-0.5 text-sm" style={{ color: "#3D5A3E" }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
          <div className="w-full max-w-md rounded-2xl border border-[#0A2E12]/10 bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h2
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
              >
                Sign In
              </h2>
              <p className="mt-3 text-base" style={{ color: "#3D5A3E" }}>
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
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-base" style={{ color: "#3D5A3E" }}>
              No account yet?{" "}
              <Link
                href={returnTo !== "/" ? `/signup?returnTo=${encodeURIComponent(returnTo)}` : "/signup"}
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
