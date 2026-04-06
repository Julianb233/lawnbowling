"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, AlertTriangle, Loader2, Eye, EyeOff } from "lucide-react";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Supabase automatically picks up the recovery token from the URL hash
  // when the user clicks the password reset link in their email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionReady(true);
        }
      }
    );
    // Also check if user already has a session (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      // Redirect to board after a short delay
      setTimeout(() => {
        router.push("/board");
        router.refresh();
      }, 2000);
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
            Set New Password
          </h1>
          <p className="mt-2 text-center text-base" style={{ color: "#3D5A3E" }}>
            Choose a new password for your account.
          </p>
        </div>

        {success ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
            <h2
              className="text-lg font-semibold"
              style={{ color: "#0A2E12" }}
            >
              Password updated
            </h2>
            <p className="mt-2 text-base" style={{ color: "#3D5A3E" }}>
              Your password has been changed. Redirecting you now...
            </p>
          </div>
        ) : !sessionReady ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-amber-600" />
            <p className="text-base" style={{ color: "#3D5A3E" }}>
              Verifying your reset link...
            </p>
            <p className="mt-3 text-sm" style={{ color: "#3D5A3E" }}>
              If this takes too long,{" "}
              <Link
                href="/forgot-password"
                className="font-semibold underline"
                style={{ color: "#1B5E20" }}
              >
                request a new reset link
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-base font-medium"
                style={{ color: "#0A2E12" }}
              >
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
                  style={{ color: "#3D5A3E" }}
                />
                <input
                  id="new-password"
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

            <div>
              <label
                htmlFor="confirm-new-password"
                className="mb-2 block text-base font-medium"
                style={{ color: "#0A2E12" }}
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
                  style={{ color: "#3D5A3E" }}
                />
                <input
                  id="confirm-new-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="block h-14 w-full rounded-xl border border-[#0A2E12]/10 bg-white py-4 pl-11 pr-4 text-lg shadow-sm transition focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
                  style={{ color: "#0A2E12" }}
                  placeholder="Repeat your new password"
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
                "Update Password"
              )}
            </button>

            <p className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: "#1B5E20" }}
              >
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
