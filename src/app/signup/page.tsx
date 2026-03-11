"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleDot, Mail, Lock, User } from "lucide-react";

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
        <div className="w-full max-w-sm space-y-6 rounded-2xl border border-[#1B5E20]/10 bg-white p-8 text-center shadow-lg shadow-[#1B5E20]/5">
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
      {/* Subtle brand background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#1B5E20]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#B8860B]/5 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E20]">
              <CircleDot className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
              Lawnbowling
            </span>
          </Link>

          <div className="rounded-2xl border border-[#0A2E12]/5 bg-white p-8 shadow-lg shadow-[#1B5E20]/5">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
                Create your account
              </h1>
              <p className="mt-2 text-sm text-[#3D5A3E]">
                Join the green in seconds
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#0A2E12]">
                  Display Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]/50" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] py-3 pl-10 pr-3 text-[#0A2E12] placeholder-[#3D5A3E]/40 shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                    placeholder="Your name"
                  />
                </div>
              </div>

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
                    minLength={6}
                    className="block w-full rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] py-3 pl-10 pr-3 text-[#0A2E12] placeholder-[#3D5A3E]/40 shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
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
                className="w-full rounded-full bg-[#1B5E20] py-3 text-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/20 transition-all hover:bg-[#2E7D32] hover:shadow-xl hover:shadow-[#1B5E20]/25 disabled:opacity-50 active:scale-[0.97]"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#3D5A3E]">
              Already have an account?{" "}
              <Link href={returnTo !== "/" ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login"} className="font-medium text-[#1B5E20] hover:text-[#2E7D32]">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
