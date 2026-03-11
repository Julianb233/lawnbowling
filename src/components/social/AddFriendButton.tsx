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
          "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-[#2E7D32] bg-[#1B5E20]/5",
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
        "bg-[#1B5E20]/5 text-[#2E7D32] hover:bg-[#1B5E20]/10 transition-colors",
        className
      )}
    >
      + Add Friend
    </button>
  );
}
