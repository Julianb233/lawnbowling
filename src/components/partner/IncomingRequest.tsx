"use client";

import { useState, useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";
import { SPORT_LABELS, SKILL_LABELS } from "@/lib/types";
import { getSportColor } from "@/lib/design";
import { cn } from "@/lib/utils";
import type { SkillLevel, Sport } from "@/lib/types";

interface IncomingRequestProps {
  request: {
    id: string;
    sport: string;
    expires_at: string;
    requester?: {
      id: string;
      display_name?: string;
      name?: string;
      avatar_url: string | null;
      skill_level: SkillLevel;
      sports: string[];
    };
  };
  onRespond: (requestId: string, accept: boolean) => Promise<void>;
}

export function IncomingRequest({ request, onRespond }: IncomingRequestProps) {
  const [responding, setResponding] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [dismissed, setDismissed] = useState(false);

  const requester = request.requester;
  const requesterName = requester?.display_name || requester?.name || "Someone";
  const initials = requesterName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sportColor = getSportColor(request.sport);

  useEffect(() => {
    function updateTimer() {
      const remaining = new Date(request.expires_at).getTime() - Date.now();
      if (remaining <= 0) {
        setTimeLeft("Expired");
        setDismissed(true);
        return;
      }
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [request.expires_at]);

  async function handleRespond(accept: boolean) {
    if (responding) return;
    setResponding(true);
    try {
      await onRespond(request.id, accept);
      setDismissed(true);
    } catch {
      // Error handled by caller
    } finally {
      setResponding(false);
    }
  }

  if (dismissed) return null;

  const sportInfo = SPORT_LABELS[request.sport as Sport];
  const skillInfo = requester ? SKILL_LABELS[requester.skill_level] : null;

  return (
    <Toast.Root
      className="rounded-2xl glass p-4 shadow-2xl ring-pulse data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full"
      style={{ boxShadow: `0 0 30px ${sportColor.glow}, 0 10px 40px rgba(0,0,0,0.4)` }}
      duration={Infinity}
      open={!dismissed}
      onOpenChange={(open) => !open && setDismissed(true)}
    >
      <div className="flex items-start gap-3">
        {requester?.avatar_url ? (
          <img
            src={requester.avatar_url}
            alt={requesterName}
            className={cn("h-12 w-12 shrink-0 rounded-full object-cover ring-2 shadow-lg", sportColor.ring)}
          />
        ) : (
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ring-2 shadow-lg",
            `bg-gradient-to-br ${sportColor.gradient}`,
            sportColor.ring
          )}>
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <Toast.Title className="text-sm font-semibold text-zinc-900">
            Partner Request!
          </Toast.Title>
          <Toast.Description className="mt-1 text-sm text-zinc-400">
            <span className="font-medium text-zinc-700">{requesterName}</span>{" "}
            wants to play{" "}
            <span className="font-medium text-zinc-700">
              {sportInfo?.emoji || ""} {sportInfo?.label || request.sport}
            </span>
          </Toast.Description>

          {skillInfo && (
            <div className="mt-1 text-xs text-amber-400">
              {"\u2605".repeat(skillInfo.stars)}{"\u2606".repeat(3 - skillInfo.stars)}{" "}
              <span className="text-zinc-500">{skillInfo.label}</span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => handleRespond(true)}
              disabled={responding}
              className={cn(
                "flex-1 rounded-xl px-3 py-2 text-sm font-bold text-white btn-press min-h-[44px]",
                `bg-gradient-to-r ${sportColor.gradient}`,
                "disabled:opacity-50"
              )}
            >
              {responding ? "..." : "Accept"}
            </button>
            <button
              onClick={() => handleRespond(false)}
              disabled={responding}
              className="flex-1 rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-700 btn-press disabled:opacity-50 min-h-[44px]"
            >
              Decline
            </button>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-mono text-zinc-500 tabular-nums">
          {timeLeft}
        </span>
      </div>
    </Toast.Root>
  );
}

export function IncomingRequestProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Toast.Provider swipeDirection="right">
      {children}
      <Toast.Viewport className="fixed top-16 right-4 z-50 flex w-full max-w-sm flex-col gap-3" />
    </Toast.Provider>
  );
}
