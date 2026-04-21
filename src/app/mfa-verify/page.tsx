"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import Image from "next/image";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";
import { Suspense } from "react";

export default function MfaVerifyPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-3"
          style={{ backgroundColor: "#FEFCF9" }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
          <span className="text-sm font-medium text-[#1B5E20]">
            Loading...
          </span>
        </div>
      }
    >
      <MfaVerifyForm />
    </Suspense>
  );
}

function MfaVerifyForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const returnTo = searchParams.get("returnTo") || "/board";

  useEffect(() => {
    checkMfaRequired();
  }, []);

  async function checkMfaRequired() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError) throw aalError;

      // Already at AAL2 or no MFA enrolled — go to destination
      if (
        aalData.currentLevel === "aal2" ||
        aalData.nextLevel === "aal1"
      ) {
        router.replace(returnTo);
        return;
      }

      // Need MFA verification — find the TOTP factor
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp.find(
        (f) => f.status === "verified"
      );

      if (!totpFactor) {
        // No verified factor — skip MFA
        router.replace(returnTo);
        return;
      }

      setFactorId(totpFactor.id);
      setChecking(false);
    } catch {
      router.replace(returnTo);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || !code) return;

    setError(null);
    setLoading(true);

    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (verifyError) throw verifyError;

      router.replace(returnTo);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid code. Please try again."
      );
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3"
        style={{ backgroundColor: "#FEFCF9" }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
        <span className="text-sm font-medium text-[#1B5E20]">
          Checking security...
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "#FEFCF9" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src={bowlsIconImg}
            alt="Lawnbowling"
            width={48}
            height={48}
            className="rounded-full shadow-lg"
          />
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "#0A2E12",
            }}
          >
            Two-Factor Verification
          </h1>
          <p className="text-center text-sm" style={{ color: "#3D5A3E" }}>
            Enter the 6-digit code from your authenticator app to continue.
          </p>
        </div>

        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              Your admin account requires two-factor authentication.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label
                htmlFor="mfa-code"
                className="mb-2 block text-sm font-medium"
                style={{ color: "#3D5A3E" }}
              >
                Authentication Code
              </label>
              <input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                autoFocus
                className="w-full rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.3em] outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 min-h-[56px] transition"
                style={{ color: "#0A2E12" }}
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-4 text-base font-bold text-white hover:bg-[#145218] disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] transition-colors"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
              {loading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
