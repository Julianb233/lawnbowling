"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Zap, MapPin, Trophy, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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

    router.push("/");
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
      title: "Real-Time Board",
      desc: "See who's available right now",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      icon: Users,
      title: "Partner Matching",
      desc: "Find your perfect match instantly",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      icon: MapPin,
      title: "Court Management",
      desc: "Auto-assigned courts with timers",
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      icon: Trophy,
      title: "Track Stats",
      desc: "Games played, partners, and more",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  if (magicLinkSent) {
    return (
      <div className="landing-gradient flex min-h-screen items-center justify-center px-4">
        <div className="glass-card-light w-full max-w-sm space-y-6 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Mail className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="text-gray-500">
            We sent a magic link to <strong className="text-gray-900">{email}</strong>
          </p>
          <Button
            variant="ghost"
            onClick={() => setMagicLinkSent(false)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-gradient min-h-screen">
      {/* Decorative blurred circles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        {/* Left: Hero / Features */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 lg:py-0">
          <div className="mx-auto w-full max-w-lg">
            {/* Brand */}
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg shadow-emerald-500/20">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Pick a Partner</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 lg:text-5xl">
              Find Your{" "}
              <span className="text-gradient-brand">Perfect Match</span>
              <br />
              <span className="text-gray-400">Hit the Court</span>
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-gray-500">
              The real-time player board for recreational sports venues.
              Check in, pick a partner, and play.
            </p>

            {/* Feature Cards */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="glass-card-light flex items-start gap-3 p-4"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${f.bg}`}>
                    <f.icon className={`h-4 w-4 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
                    <p className="mt-0.5 text-xs text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
          <div className="glass-card-light w-full max-w-md p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-500">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-gray-200 bg-white/70 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 shadow-sm backdrop-blur transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-gray-200 bg-white/70 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 shadow-sm backdrop-blur transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Your password"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-110 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/80 px-3 text-gray-400">or</span>
              </div>
            </div>

            <button
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-white/70 py-3 text-sm font-semibold text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                Send Magic Link
              </span>
            </button>

            <p className="mt-6 text-center text-sm text-gray-500">
              No account?{" "}
              <Link href="/signup" className="font-medium text-emerald-600 hover:text-emerald-700">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
