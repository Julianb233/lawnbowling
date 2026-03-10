"use client";

import { ShieldCheck, ShieldAlert } from "lucide-react";
import type { Waiver } from "@/lib/db/waivers";

interface WaiverStatusProps {
  waiver: Waiver | null;
}

export function WaiverStatus({ waiver }: WaiverStatusProps) {
  if (!waiver) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
        <ShieldAlert className="h-5 w-5 shrink-0 text-yellow-400" />
        <div>
          <p className="text-sm font-medium text-yellow-400">Waiver Not Signed</p>
          <p className="text-xs text-yellow-400/70">You must sign the liability waiver before playing.</p>
        </div>
      </div>
    );
  }

  const signedDate = new Date(waiver.signed_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
      <ShieldCheck className="h-5 w-5 shrink-0 text-green-400" />
      <div>
        <p className="text-sm font-medium text-green-400">Waiver Signed</p>
        <p className="text-xs text-green-400/70">Signed on {signedDate}</p>
      </div>
    </div>
  );
}
