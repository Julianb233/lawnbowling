"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InviteLinkProps {
  inviteCode: string;
}

export function InviteLink({ inviteCode }: InviteLinkProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/teams/join/${inviteCode}`
    : `/teams/join/${inviteCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my team on Lawnbowling!",
          url: inviteUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-4">
      <p className="mb-2 text-sm font-medium text-[#3D5A3E]">Invite Link</p>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 truncate rounded-lg bg-[#0A2E12]/5 px-3 py-2 text-sm text-[#3D5A3E] font-mono">
          {inviteCode}
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
            copied
              ? "bg-[#1B5E20]/10 text-[#1B5E20]"
              : "bg-[#0A2E12]/5 text-[#3D5A3E] hover:text-[#2D4A30]"
          )}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
        <button
          onClick={handleShare}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A2E12]/5 text-[#3D5A3E] transition-colors hover:text-[#2D4A30]"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
