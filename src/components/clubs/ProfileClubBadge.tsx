"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

interface ProfileClubBadgeProps {
  clubId: string | null;
  isOwnProfile: boolean;
}

interface ClubInfo {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  city: string;
  state_code: string;
}

export function ProfileClubBadge({ clubId, isOwnProfile }: ProfileClubBadgeProps) {
  const [club, setClub] = useState<ClubInfo | null>(null);

  useEffect(() => {
    if (!clubId) return;
    fetch(`/api/clubs/info?id=${clubId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setClub(data);
      })
      .catch(() => {});
  }, [clubId]);

  if (!clubId) {
    if (isOwnProfile) {
      return (
        <Link
          href="/settings"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-zinc-300 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-400 hover:text-zinc-500"
        >
          <Building2 className="h-3.5 w-3.5" />
          Set home club
        </Link>
      );
    }
    return null;
  }

  if (!club) return null;

  const stateCode = club.state_code?.toLowerCase() ?? "";

  return (
    <Link
      href={`/clubs/${stateCode}/${club.slug}`}
      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#1B5E20]/10 px-3 py-1 text-xs font-medium text-[#1B5E20] hover:bg-[#1B5E20]/20"
    >
      <Building2 className="h-3.5 w-3.5" />
      {club.name}
    </Link>
  );
}
