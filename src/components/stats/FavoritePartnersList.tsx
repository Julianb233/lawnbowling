"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Trophy } from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";
import Link from "next/link";
import type { FavoritePartner } from "@/lib/types";

interface FavoritePartnersListProps {
  playerId: string;
}

export function FavoritePartnersList({ playerId }: FavoritePartnersListProps) {
  const [partners, setPartners] = useState<FavoritePartner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = useCallback(async () => {
    try {
      const res = await fetch(`/api/stats/${playerId}?partners=true&history=false`);
      if (res.ok) {
        const data = await res.json();
        setPartners(data.favoritePartners ?? []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [playerId]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 text-center">
        <Users className="mx-auto mb-2 h-10 w-10 text-zinc-300" />
        <p className="text-sm text-zinc-500">No partners yet. Play some doubles!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {partners.map((fp, index) => {
        const initials = fp.partner?.display_name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) ?? "?";

        return (
          <Link
            key={fp.partner_id}
            href={`/profile/${fp.partner_id}`}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 transition-colors hover:bg-zinc-100"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-500">
              {index + 1}
            </span>

            <Avatar.Root className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
              <Avatar.Image
                src={fp.partner?.avatar_url ?? undefined}
                alt={fp.partner?.display_name ?? ""}
                className="h-full w-full object-cover"
              />
              <Avatar.Fallback className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500">
                {initials}
              </Avatar.Fallback>
            </Avatar.Root>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {fp.partner?.display_name ?? "Unknown"}
              </p>
              <p className="text-xs text-zinc-500">
                {fp.games_together} game{fp.games_together !== 1 ? "s" : ""} together
              </p>
            </div>

            <div className="flex items-center gap-1 text-right">
              <Trophy className="h-3 w-3 text-[#1B5E20]" />
              <span className="text-sm font-bold text-[#1B5E20]">
                {Math.round(fp.win_rate_together)}%
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
