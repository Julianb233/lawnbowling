"use client";

import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClubBadgeProps {
  clubId: string | null;
  size?: "sm" | "md";
  showName?: boolean;
  className?: string;
}

interface ClubInfo {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  city: string;
  state_code: string;
}

export function ClubBadge({ clubId, size = "sm", showName = true, className }: ClubBadgeProps) {
  const [club, setClub] = useState<ClubInfo | null>(null);

  useEffect(() => {
    if (!clubId) return;
    fetch(`/api/clubs/info?id=${clubId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setClub(data);
      })
      .catch(() => {});
  }, [clubId]);

  if (!clubId || !club) return null;

  const initials = club.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const iconSize = size === "sm" ? "h-5 w-5" : "h-7 w-7";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-[#1B5E20]/10",
          iconSize
        )}
      >
        {club.logo_url ? (
          <img
            src={club.logo_url}
            alt={club.name}
            className={cn("rounded-full object-cover", iconSize)}
          />
        ) : (
          <span className="text-[9px] font-bold text-[#1B5E20]">{initials}</span>
        )}
      </div>
      {showName && (
        <span className={cn("font-medium text-[#3D5A3E] truncate", textSize)}>
          {club.name}
        </span>
      )}
    </div>
  );
}

export function ClubBadgeInline({ clubId, className }: { clubId: string | null; className?: string }) {
  const [club, setClub] = useState<ClubInfo | null>(null);

  useEffect(() => {
    if (!clubId) return;
    fetch(`/api/clubs/info?id=${clubId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setClub(data);
      })
      .catch(() => {});
  }, [clubId]);

  if (!clubId || !club) return null;

  const initials = club.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[#1B5E20]/10 px-2 py-0.5 text-[10px] font-bold text-[#1B5E20]",
        className
      )}
    >
      {initials}
    </span>
  );
}
