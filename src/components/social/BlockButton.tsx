"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

interface BlockButtonProps {
  targetId: string;
  className?: string;
}

export function BlockButton({ targetId, className }: BlockButtonProps) {
  const [blocked, setBlocked] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleBlock() {
    if (!confirm("Are you sure you want to block this player? They won't be able to interact with you.")) return;
    startTransition(async () => {
      const res = await fetch("/api/friends/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked_id: targetId }),
      });
      if (res.ok) setBlocked(true);
    });
  }

  if (blocked) {
    return (
      <span className={cn("text-xs text-red-400", className)}>Blocked</span>
    );
  }

  return (
    <button
      onClick={handleBlock}
      disabled={isPending}
      className={cn(
        "text-xs text-zinc-500 hover:text-red-400 transition-colors",
        className
      )}
    >
      Block Player
    </button>
  );
}
