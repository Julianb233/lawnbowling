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
          "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50",
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
          "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50",
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
        "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors",
        className
      )}
    >
      + Add Friend
    </button>
  );
}
