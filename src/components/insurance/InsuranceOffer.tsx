"use client";

import { useState } from "react";
import { Shield, ExternalLink, X } from "lucide-react";

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
    <div className="relative rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6">
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-full p-1 text-white/40 hover:text-white/80 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
          <Shield className="h-6 w-6 text-blue-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-white">Protect Yourself with Event Insurance</h3>
          <p className="text-sm text-white/60">
            Get liability coverage for your recreational sports activities. Daily Event Insurance offers
            affordable per-event coverage so you can play with peace of mind.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="https://dailyeventinsurance.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onStatusUpdate?.("active")}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 min-h-[44px]"
            >
              Get Coverage <ExternalLink className="h-4 w-4" />
            </a>
            <button
              onClick={handleDismiss}
              className="rounded-lg border border-white/20 px-4 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 min-h-[44px]"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
