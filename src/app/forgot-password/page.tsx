"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/callback?returnTo=/settings`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: "#FEFCF9" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Image
            src={bowlsIconImg}
            alt="Lawnbowling"
            width={48}
            height={48}
            className="rounded-full shadow-lg"
          />
          <h1
            className="mt-4 text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
          >
            Reset Your Password
          </h1>
          <p className="mt-2 text-center text-base" style={{ color: "#3D5A3E" }}>
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
            <h2
              className="text-lg font-semibold"
              style={{ color: "#0A2E12" }}
            >
              Check your email
            </h2>
            <p className="mt-2 text-base" style={{ color: "#3D5A3E" }}>
              We sent a password reset link to{" "}
              <span className="font-medium" style={{ color: "#0A2E12" }}>
                {email}
              </span>
              . Click the link in the email to set a new password.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:underline"
              style={{ color: "#1B5E20" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="reset-email"
                className="mb-2 block text-base font-medium"
                style={{ color: "#0A2E12" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
                  style={{ color: "#3D5A3E" }}
                />
                <input
                  id="reset-email"
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
              {loading ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </button>

            <p className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: "#1B5E20" }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
