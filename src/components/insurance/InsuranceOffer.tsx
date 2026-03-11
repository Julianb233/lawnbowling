"use client";

import { useState } from "react";
import { Shield, ExternalLink, X, CheckCircle2, DollarSign, Zap } from "lucide-react";

interface InsuranceOfferProps {
  onDismiss: () => void;
  onStatusUpdate?: (status: "active") => Promise<void>;
}

export function InsuranceOffer({ onDismiss, onStatusUpdate }: InsuranceOfferProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    onDismiss();
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#1B5E20]/30 bg-gradient-to-br from-[#1B5E20]/10 via-[#1B5E20]/5 to-purple-500/10 p-6">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#1B5E20]/5 blur-2xl" />
      <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-[#1B5E20]/5 blur-2xl" />

      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-full p-1 text-zinc-400 hover:text-zinc-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1B5E20]/20">
            <Shield className="h-6 w-6 text-[#1B5E20]" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">FREE Liability Insurance</h3>
            <p className="text-xs text-[#1B5E20] font-medium">Powered by Daily Event Insurance</p>
          </div>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Protect your players with per-participant liability coverage — completely free for your venue.
          Coverage activates instantly and is underwritten by A-rated carriers including AIG and Lloyd&apos;s of London.
        </p>

        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <CheckCircle2 className="h-4 w-4 text-[#1B5E20] shrink-0" />
            <span>Zero cost — no setup fees, no monthly charges</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <DollarSign className="h-4 w-4 text-[#1B5E20] shrink-0" />
            <span>Earn $2-$10 for every covered participant</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <Zap className="h-4 w-4 text-[#1B5E20] shrink-0" />
            <span>10-minute setup, coverage live within 48 hours</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="https://dailyeventinsurance.com/m/lawnbowling/quote/new"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onStatusUpdate?.("active")}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B5E20] min-h-[44px] shadow-sm"
          >
            Get Free Coverage <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={handleDismiss}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 min-h-[44px]"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
