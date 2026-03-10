"use client";

import { useEffect, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import { Check, X, Clock } from "lucide-react";
import { getSportColor } from "@/lib/design";
import { SPORT_LABELS } from "@/lib/types";
import type { Sport } from "@/lib/types";

interface SentRequestToastProps {
  targetName: string;
  sport: string;
  status: "accepted" | "declined" | "expired";
  onDismiss: () => void;
}

const STATUS_CONFIG = {
  accepted: {
    icon: Check,
    getMessage: (name: string, sport: string) => {
      const sportInfo = SPORT_LABELS[sport as Sport];
      const sportLabel = sportInfo?.label || sport;
      return `You and ${name} are matched for ${sportLabel}!`;
    },
    bgClass: "bg-emerald-500/15",
    textClass: "text-emerald-300",
    ringClass: "ring-emerald-500/30",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  declined: {
    icon: X,
    getMessage: (name: string) => `${name} declined your request`,
    bgClass: "bg-zinc-700/60",
    textClass: "text-zinc-300",
    ringClass: "ring-zinc-600/30",
    iconBg: "bg-zinc-600/30",
    iconColor: "text-zinc-400",
  },
  expired: {
    icon: Clock,
    getMessage: (name: string) => `Request to ${name} expired`,
    bgClass: "bg-amber-500/15",
    textClass: "text-amber-300",
    ringClass: "ring-amber-500/30",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
};

export function SentRequestToast({
  targetName,
  sport,
  status,
  onDismiss,
}: SentRequestToastProps) {
  const [open, setOpen] = useState(true);
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const sportColor = getSportColor(sport);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Toast.Root
      className={`rounded-2xl p-4 shadow-2xl ring-1 backdrop-blur-md ${config.bgClass} ${config.ringClass} data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full`}
      style={
        status === "accepted"
          ? { boxShadow: `0 0 20px ${sportColor.glow}, 0 8px 30px rgba(0,0,0,0.3)` }
          : { boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }
      }
      duration={4000}
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(false);
          onDismiss();
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.iconBg}`}
        >
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <Toast.Title className={`text-sm font-semibold ${config.textClass}`}>
            {config.getMessage(targetName, sport)}
          </Toast.Title>
        </div>
        <Toast.Close
          className="shrink-0 rounded-full p-2 text-zinc-500 hover:text-zinc-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Toast.Close>
      </div>
    </Toast.Root>
  );
}
