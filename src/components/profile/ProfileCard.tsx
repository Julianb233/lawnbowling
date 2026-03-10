"use client";

import * as Avatar from "@radix-ui/react-avatar";
import { SkillBadge } from "./SkillBadge";
import { SportsTags } from "./SportsTags";
import type { PlayerProfile } from "@/lib/db/players";
import { Shield, ShieldCheck } from "lucide-react";

interface ProfileCardProps {
  player: PlayerProfile;
  onClick?: () => void;
  compact?: boolean;
}

export function ProfileCard({ player, onClick, compact = false }: ProfileCardProps) {
  const initials = player.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 text-left transition-colors ${
        onClick ? "cursor-pointer hover:bg-zinc-50 min-h-[44px]" : ""
      } ${compact ? "p-3" : "p-4"}`}
    >
      <Avatar.Root
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 ${
          compact ? "h-10 w-10" : "h-14 w-14"
        }`}
      >
        <Avatar.Image
          src={player.avatar_url ?? undefined}
          alt={player.display_name}
          className="h-full w-full object-cover"
        />
        <Avatar.Fallback className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500">
          {initials}
        </Avatar.Fallback>
      </Avatar.Root>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold text-zinc-900 truncate ${compact ? "text-sm" : "text-base"}`}>
            {player.display_name}
          </h3>
          {player.insurance_status === "active" ? (
            <ShieldCheck className="h-4 w-4 shrink-0 text-green-600" />
          ) : (
            <Shield className="h-4 w-4 shrink-0 text-zinc-400" />
          )}
        </div>
        <div className="mt-1">
          <SkillBadge level={player.skill_level} />
        </div>
        {!compact && player.sports.length > 0 && (
          <div className="mt-2">
            <SportsTags sports={player.sports} size="sm" />
          </div>
        )}
      </div>
    </Component>
  );
}
