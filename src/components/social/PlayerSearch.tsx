"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, UserPlus, Loader2, X } from "lucide-react";
import { AddFriendButton } from "./AddFriendButton";
import Link from "next/link";

interface SearchResult {
  id: string;
  display_name: string;
  avatar_url: string | null;
  skill_level: string;
  sports: string[];
}

interface PlayerSearchProps {
  currentPlayerId: string;
  friendIds: string[];
}

export function PlayerSearch({ currentPlayerId, friendIds }: PlayerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out self and existing friends
          const filtered = (data.players ?? []).filter(
            (p: SearchResult) =>
              p.id !== currentPlayerId && !friendIds.includes(p.id)
          );
          setResults(filtered);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [currentPlayerId, friendIds]
  );

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            handleChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for players to add..."
          className="w-full rounded-xl border border-[#0A2E12]/10 bg-white pl-10 pr-10 py-3 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E]/40 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20] min-h-[44px]"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D5A3E]/40 hover:text-[#3D5A3E]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-[#0A2E12]/10 bg-white shadow-lg">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#1B5E20]" />
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="py-6 text-center">
              <UserPlus className="mx-auto mb-1 h-5 w-5 text-[#3D5A3E]/30" />
              <p className="text-xs text-[#3D5A3E]">
                No players found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {!loading &&
            results.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 border-b border-[#0A2E12]/5 px-4 py-3 last:border-b-0 hover:bg-[#F0FFF4] transition-colors"
              >
                <Link
                  href={`/profile/${player.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  {player.avatar_url ? (
                    <img
                      src={player.avatar_url}
                      alt={player.display_name}
                      className="h-9 w-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B5E20]/10 text-sm font-bold text-[#1B5E20]">
                      {player.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0A2E12] truncate">
                      {player.display_name}
                    </p>
                    <p className="text-xs text-[#3D5A3E] capitalize">
                      {player.skill_level}
                    </p>
                  </div>
                </Link>
                <AddFriendButton targetId={player.id} status="none" size="sm" />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
