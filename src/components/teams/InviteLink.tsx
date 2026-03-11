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
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="mb-2 text-sm font-medium text-zinc-400">Invite Link</p>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 truncate rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-600 font-mono">
          {inviteCode}
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
            copied
              ? "bg-[#1B5E20]/10 text-[#1B5E20]"
              : "bg-zinc-100 text-zinc-400 hover:text-zinc-700"
          )}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
        <button
          onClick={handleShare}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400 transition-colors hover:text-zinc-700"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
