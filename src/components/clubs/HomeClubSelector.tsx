"use client";

import { useState, useEffect } from "react";
import { Search, Building2, Check, X } from "lucide-react";
import { searchClubs, getClubById } from "@/lib/clubs-data";
import type { ClubData } from "@/lib/clubs-data";
import { cn } from "@/lib/utils";

interface HomeClubSelectorProps {
  currentClubId: string | null;
  onSelect: (clubId: string | null) => void;
  showSkip?: boolean;
  onSkip?: () => void;
}

export function HomeClubSelector({ currentClubId, onSelect, showSkip, onSkip }: HomeClubSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClubData[]>([]);
  const [selected, setSelected] = useState<ClubData | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (currentClubId) {
      const club = getClubById(currentClubId);
      if (club) setSelected(club);
    }
  }, [currentClubId]);

  useEffect(() => {
    if (query.length >= 2) {
      setResults(searchClubs(query).slice(0, 8));
    } else {
      setResults([]);
    }
  }, [query]);

  function handleSelect(club: ClubData) {
    if (currentClubId && currentClubId !== club.id) {
      setConfirming(true);
      setSelected(club);
    } else {
      setSelected(club);
      onSelect(club.id);
      setQuery("");
      setResults([]);
    }
  }

  function confirmChange() {
    if (selected) {
      onSelect(selected.id);
      setConfirming(false);
      setQuery("");
      setResults([]);
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">Home Club</label>

      {confirming && selected && (
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            You are changing your home club to <strong>{selected.name}</strong>. Your stats and match history will remain unchanged.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={confirmChange}
              className="rounded-lg bg-[#1B5E20] px-3 py-1.5 text-xs font-bold text-white"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selected && !confirming ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#1B5E20]/30 bg-[#1B5E20]/5 p-3">
          <Building2 className="h-5 w-5 shrink-0 text-[#1B5E20]" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-900">{selected.name}</p>
            <p className="text-xs text-zinc-500">
              {selected.city}, {selected.stateCode}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              onSelect(null);
            }}
            className="shrink-0 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : !confirming ? (
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for your club..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-100 pl-9 pr-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
            />
          </div>

          {results.length > 0 && (
            <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-zinc-200 bg-white">
              {results.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => handleSelect(club)}
                  className="flex w-full items-center gap-3 border-b border-zinc-100 px-3 py-2.5 text-left last:border-0 hover:bg-zinc-50"
                >
                  <Building2 className="h-4 w-4 shrink-0 text-zinc-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 truncate">{club.name}</p>
                    <p className="text-xs text-zinc-500">{club.city}, {club.stateCode}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && results.length === 0 && (
            <p className="mt-2 text-center text-xs text-zinc-400">No clubs found</p>
          )}

          {showSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="mt-3 w-full text-center text-sm text-zinc-400 hover:text-zinc-600"
            >
              Skip for now
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
