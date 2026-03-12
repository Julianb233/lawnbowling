"use client";

import { useEffect } from "react";
import * as Toast from "@radix-ui/react-toast";
import { Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSportColor } from "@/lib/design";
import { SPORT_LABELS } from "@/lib/types";
import type { Sport } from "@/lib/types";

export interface SentRequestToastProps {
  targetName: string;
  sport: string;
  status: "accepted" | "declined" | "expired";
  onDismiss: () => void;
}

const STATUS_CONFIG = {
  accepted: {
    icon: Check,
    message: (name: string, sport: string) => {
      const info = SPORT_LABELS[sport as Sport];
      return `You and ${name} are matched for ${info?.label || sport}!`;
    },
    containerClass: "bg-[#1B5E20]/15 ring-1 ring-[#1B5E20]/30",
    iconClass: "bg-[#1B5E20]/20 text-[#1B5E20]",
    textClass: "text-[#1B5E20]",
  },
  declined: {
    icon: X,
    message: (name: string) => `${name} declined your request`,
    containerClass: "bg-[#0A2E12]/60 ring-1 ring-[#0A2E12]/10/30",
    iconClass: "bg-[#0A2E12]/5/40 text-[#3D5A3E]",
    textClass: "text-[#3D5A3E]",
  },
  expired: {
    icon: Clock,
    message: (name: string) => `Request to ${name} expired`,
    containerClass: "bg-amber-500/10 ring-1 ring-amber-500/25",
    iconClass: "bg-amber-500/20 text-amber-400",
    textClass: "text-amber-300",
  },
} as const;

export function SentRequestToast({
  targetName,
  sport,
  status,
  onDismiss,
}: SentRequestToastProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const sportColor = getSportColor(sport);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Toast.Root
      className={cn(
        "rounded-2xl p-4 shadow-2xl backdrop-blur-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full",
        config.containerClass
      )}
      style={
        status === "accepted"
          ? { boxShadow: `0 0 25px ${sportColor.glow}, 0 8px 30px rgba(0,0,0,0.3)` }
          : { boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }
      }
      duration={4000}
      onOpenChange={(open) => !open && onDismiss()}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            config.iconClass
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <Toast.Description className={cn("text-sm font-medium", config.textClass)}>
            {config.message(targetName, sport)}
          </Toast.Description>
        </div>

        <Toast.Close
          className="shrink-0 rounded-full p-2 text-[#3D5A3E] hover:text-[#3D5A3E] transition-colors touch-manipulation"
          aria-label="Dismiss notification"
          style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <X className="h-4 w-4" />
        </Toast.Close>
      </div>
    </Toast.Root>
  );
}
