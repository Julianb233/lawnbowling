"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

interface AddFriendButtonProps {
  targetId: string;
  status?: "none" | "pending" | "accepted" | "blocked";
  className?: string;
}

export function AddFriendButton({
  targetId,
  status = "none",
  className,
}: AddFriendButtonProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isPending, startTransition] = useTransition();

  function sendRequest() {
    startTransition(async () => {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friend_id: targetId }),
      });
      if (res.ok) setCurrentStatus("pending");
    });
  }

  if (currentStatus === "accepted") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10",
          className
        )}
      >
        Friends
      </span>
    );
  }

  if (currentStatus === "pending") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-400/10",
          className
        )}
      >
        Pending
      </span>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium",
        "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors",
        className
      )}
    >
      + Add Friend
    </button>
  );
}
