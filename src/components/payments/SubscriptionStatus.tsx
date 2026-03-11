"use client";

import { Crown, Zap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/lib/types";

interface SubscriptionStatusProps {
  plan: SubscriptionPlan;
}

const PLAN_CONFIG: Record<SubscriptionPlan, { icon: React.ReactNode; label: string; color: string }> = {
  free: { icon: <Zap className="h-3.5 w-3.5" />, label: "Free", color: "bg-zinc-700 text-zinc-600" },
  basic: { icon: <Zap className="h-3.5 w-3.5" />, label: "Basic", color: "bg-[#1B5E20]/20 text-blue-400" },
  premium: { icon: <Crown className="h-3.5 w-3.5" />, label: "Premium", color: "bg-amber-500/20 text-amber-400" },
  venue_owner: { icon: <Building2 className="h-3.5 w-3.5" />, label: "Venue Owner", color: "bg-green-500/20 text-green-400" },
};

export function SubscriptionStatus({ plan }: SubscriptionStatusProps) {
  const config = PLAN_CONFIG[plan];

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
      config.color
    )}>
      {config.icon}
      {config.label}
    </span>
  );
}
