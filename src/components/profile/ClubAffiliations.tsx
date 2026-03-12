"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Building2, Plus, X, Search } from "lucide-react";
import { searchClubs, getClubById } from "@/lib/clubs-data";
import type { ClubData } from "@/lib/clubs-data";

interface PlayerClub {
  id: string;
  club_slug: string;
  role: "member" | "officer" | "president";
  joined_at: string;
}

interface ClubAffiliationsProps {
  playerId: string;
  editable?: boolean;
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  member: { label: "Member", color: "bg-[#0A2E12]/5 text-[#3D5A3E]" },
  officer: { label: "Officer", color: "bg-blue-50 text-blue-700" },
  president: { label: "President", color: "bg-[#1B5E20]/10 text-[#1B5E20]" },
};

export function ClubAffiliations({ playerId, editable = false }: ClubAffiliationsProps) {
  const [clubs, setClubs] = useState<PlayerClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ClubData[]>([]);
  const [joining, setJoining] = useState<string | null>(null);

  const loadClubs = useCallback(async () => {
    try {
      const url = editable
        ? "/api/profile/clubs"
        : `/api/profile/clubs?player_id=${playerId}`;
      const res = await fetch(url);
      if (res.ok) {
        setClubs(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [playerId, editable]);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchClubs(searchQuery);
      // Filter out already joined clubs
      const joinedSlugs = new Set(clubs.map((c) => c.club_slug));
      setSearchResults(results.filter((r) => !joinedSlugs.has(r.id)).slice(0, 8));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, clubs]);

  async function handleJoin(clubSlug: string) {
    setJoining(clubSlug);
    try {
      const res = await fetch("/api/profile/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ club_slug: clubSlug }),
      });
      if (res.ok) {
        await loadClubs();
        setSearchQuery("");
        setShowSearch(false);
      }
    } catch {
      // silent
    } finally {
      setJoining(null);
    }
  }

  async function handleLeave(clubSlug: string) {
    try {
      const res = await fetch(`/api/profile/clubs?club_slug=${clubSlug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setClubs((prev) => prev.filter((c) => c.club_slug !== clubSlug));
      }
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="mb-2 text-sm font-medium text-[#3D5A3E]">Club Affiliations</h2>
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-4 text-center">
          <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-[#1B5E20] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-[#3D5A3E]">
          Club Affiliations
          {clubs.length > 0 && (
            <span className="ml-1 text-[#3D5A3E]">({clubs.length})</span>
          )}
        </h2>
        {editable && !showSearch && (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-1 text-xs font-medium text-[#1B5E20] hover:underline"
          >
            <Plus className="h-3 w-3" />
            Join Club
          </button>
        )}
      </div>

      {/* Search panel */}
      {showSearch && (
        <div className="mb-3 rounded-xl border border-[#0A2E12]/10 bg-white p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clubs..."
              className="w-full rounded-lg border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] pl-9 pr-3 py-2 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
              autoFocus
            />
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
              {searchResults.map((club) => (
                <button
                  key={club.id}
                  onClick={() => handleJoin(club.id)}
                  disabled={joining === club.id}
                  className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-[#0A2E12]/[0.03] disabled:opacity-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#0A2E12] truncate">
                      {club.name}
                    </p>
                    <p className="text-xs text-[#3D5A3E]">
                      {club.city}, {club.stateCode}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-[#1B5E20]">
                    {joining === club.id ? "Joining..." : "Join"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="mt-2 text-center text-xs text-[#3D5A3E]">
              No clubs found
            </p>
          )}

          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery("");
            }}
            className="mt-2 w-full text-center text-xs text-[#3D5A3E] hover:text-[#3D5A3E]"
          >
            Cancel
          </button>
        </div>
      )}

      {clubs.length === 0 ? (
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-4 text-center">
          <Building2 className="mx-auto mb-1 h-8 w-8 text-[#3D5A3E]" />
          <p className="text-sm text-[#3D5A3E]">No club affiliations</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clubs.map((pc) => {
            const club = getClubById(pc.club_slug);
            const roleInfo = ROLE_LABELS[pc.role] ?? ROLE_LABELS.member;
            const stateCode = club?.stateCode?.toLowerCase() ?? "";

            return (
              <div
                key={pc.id}
                className="flex items-center gap-3 rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-3"
              >
                <Building2 className="h-5 w-5 shrink-0 text-[#1B5E20]" />
                <div className="min-w-0 flex-1">
                  {club ? (
                    <Link
                      href={`/clubs/${stateCode}/${pc.club_slug}`}
                      className="text-sm font-medium text-[#0A2E12] hover:text-[#1B5E20] truncate block"
                    >
                      {club.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-[#0A2E12] truncate block">
                      {pc.club_slug}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    {club && (
                      <span className="text-xs text-[#3D5A3E]">
                        {club.city}, {club.stateCode}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${roleInfo.color}`}
                    >
                      {roleInfo.label}
                    </span>
                  </div>
                </div>
                {editable && (
                  <button
                    onClick={() => handleLeave(pc.club_slug)}
                    className="shrink-0 rounded-md p-1 text-[#3D5A3E] hover:bg-red-50 hover:text-red-500"
                    title="Leave club"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
