"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ShieldCheck, ShieldOff, Copy, Check } from "lucide-react";

type MfaStatus = "loading" | "not-enrolled" | "enrolling" | "enrolled";

export function MfaEnrollment() {
  const [status, setStatus] = useState<MfaStatus>("loading");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkMfaStatus();
  }, []);

  async function checkMfaStatus() {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const totpFactors = data.totp.filter(
        (f) => f.status === "verified"
      );
      if (totpFactors.length > 0) {
        setFactorId(totpFactors[0].id);
        setStatus("enrolled");
      } else {
        setStatus("not-enrolled");
      }
    } catch {
      setStatus("not-enrolled");
    }
  }

  async function handleEnroll() {
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Lawnbowling Admin",
      });
      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStatus("enrolling");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start enrollment"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEnrollment(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || !verifyCode) return;
    setError(null);
    setLoading(true);

    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });
      if (verifyError) throw verifyError;

      setStatus("enrolled");
      setQrCode(null);
      setSecret(null);
      setVerifyCode("");
      setSuccess("Two-factor authentication enabled successfully.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUnenroll() {
    if (!factorId) return;
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });
      if (error) throw error;

      setFactorId(null);
      setStatus("not-enrolled");
      setSuccess("Two-factor authentication has been removed.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove 2FA"
      );
    } finally {
      setLoading(false);
    }
  }

  async function copySecret() {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-[#1B5E20]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          {success}
        </div>
      )}

      {status === "enrolled" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Two-factor authentication is enabled
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Your admin account is protected with an authenticator app.
              </p>
            </div>
          </div>
          <button
            onClick={handleUnenroll}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 min-h-[44px] transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldOff className="h-4 w-4" />
            )}
            Remove Two-Factor Authentication
          </button>
        </div>
      )}

      {status === "not-enrolled" && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "#3D5A3E" }}>
            Add an extra layer of security to your admin account using an
            authenticator app (e.g. Google Authenticator, Authy).
          </p>
          <button
            onClick={handleEnroll}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#145218] disabled:opacity-50 min-h-[44px] transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Enable Two-Factor Authentication
          </button>
        </div>
      )}

      {status === "enrolling" && (
        <div className="space-y-5">
          <p className="text-sm" style={{ color: "#3D5A3E" }}>
            Scan this QR code with your authenticator app, then enter the
            6-digit code to verify.
          </p>

          {qrCode && (
            <div className="flex justify-center">
              <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-4">
                <img
                  src={qrCode}
                  alt="Scan this QR code with your authenticator app"
                  width={200}
                  height={200}
                />
              </div>
            </div>
          )}

          {secret && (
            <div className="space-y-1">
              <p
                className="text-xs font-medium"
                style={{ color: "#3D5A3E" }}
              >
                Or enter this key manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] px-3 py-2 text-xs font-mono break-all">
                  {secret}
                </code>
                <button
                  onClick={copySecret}
                  className="shrink-0 rounded-lg border border-[#0A2E12]/10 p-2 hover:bg-[#0A2E12]/[0.03] transition-colors"
                  title="Copy secret"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-[#3D5A3E]" />
                  )}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleVerifyEnrollment} className="space-y-4">
            <div>
              <label
                htmlFor="mfa-code"
                className="mb-2 block text-sm font-medium"
                style={{ color: "#3D5A3E" }}
              >
                Verification Code
              </label>
              <input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                maxLength={6}
                required
                className="w-full rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-3 text-center text-xl font-bold tracking-[0.3em] outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 min-h-[44px] transition"
                style={{ color: "#0A2E12" }}
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={loading || verifyCode.length < 6}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#145218] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {loading ? "Verifying..." : "Verify & Enable"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
