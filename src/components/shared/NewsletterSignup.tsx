"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "inline" | "card" | "banner";
  className?: string;
}

export function NewsletterSignup({
  variant = "card",
  className = "",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "success") {
    return (
      <div className={`flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 ${className}`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
          <Check className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">You are subscribed!</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">We will send you the latest lawn bowling news and tips.</p>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]/50" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="w-full rounded-xl border border-[#0A2E12]/10 bg-white pl-10 pr-4 py-2.5 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E]/50 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-xl bg-[#1B5E20] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#145218] disabled:opacity-50"
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </button>
      </form>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] px-6 py-8 text-center shadow-lg ${className}`}>
        <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
          Stay in the Loop
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-green-100/80">
          Get lawn bowling tips, tournament announcements, and club news delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="mx-auto mt-4 flex max-w-md gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="flex-1 rounded-xl border-0 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#1B5E20] transition hover:bg-green-50 disabled:opacity-50"
          >
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
          </button>
        </form>
        {status === "error" && errorMessage && (
          <p className="mt-2 text-xs text-red-200">{errorMessage}</p>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={`rounded-2xl border border-[#0A2E12]/10 dark:border-white/10 bg-white dark:bg-white/5 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E20]/10">
          <Mail className="h-5 w-5 text-[#1B5E20]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#0A2E12] dark:text-[#e8f0eb]">
            Lawn Bowling Newsletter
          </h3>
          <p className="text-xs text-[#3D5A3E] dark:text-[#a8c8b4]">
            Tips, events, and news — no spam
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]/50" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full rounded-xl border border-[#0A2E12]/10 dark:border-white/10 bg-[#0A2E12]/[0.02] dark:bg-white/5 pl-10 pr-4 py-3 text-sm text-[#0A2E12] dark:text-[#e8f0eb] placeholder:text-[#3D5A3E]/50 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-xl bg-[#1B5E20] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#145218] disabled:opacity-50 min-h-[44px]"
        >
          {status === "loading" ? (
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          ) : (
            "Subscribe to Newsletter"
          )}
        </button>
        {status === "error" && errorMessage && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
        <p className="text-center text-[10px] text-[#3D5A3E]/60 dark:text-[#a8c8b4]/60">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}
