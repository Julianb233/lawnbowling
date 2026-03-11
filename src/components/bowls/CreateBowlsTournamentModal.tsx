"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Search, Building2 } from "lucide-react";
import { BOWLS_FORMAT_LABELS } from "@/lib/types";
import type { BowlsGameFormat } from "@/lib/types";
import { searchClubs } from "@/lib/clubs-data";
import type { ClubData } from "@/lib/clubs-data";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const ALL_BOWLS_FORMATS: BowlsGameFormat[] = ["fours", "triples", "pairs", "singles"];

interface CreateBowlsTournamentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateBowlsTournamentModal({ open, onOpenChange, onCreated }: CreateBowlsTournamentModalProps) {
  const [name, setName] = useState("");
  const [bowlsFormat, setBowlsFormat] = useState<BowlsGameFormat>("fours");
  const [maxPlayers, setMaxPlayers] = useState("32");
  const [startsAt, setStartsAt] = useState("");
  const [isInterClub, setIsInterClub] = useState(false);
  const [visitingClubQuery, setVisitingClubQuery] = useState("");
  const [visitingClubResults, setVisitingClubResults] = useState<ClubData[]>([]);
  const [visitingClub, setVisitingClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [homeClubId, setHomeClubId] = useState<string | null>(null);

  useEffect(() => {
    async function loadHomeClub() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: player } = await supabase
        .from("players")
        .select("home_club_id")
        .eq("user_id", user.id)
        .single();
      if (player?.home_club_id) {
        setHomeClubId(player.home_club_id);
      }
    }
    if (open) loadHomeClub();
  }, [open]);

  useEffect(() => {
    if (visitingClubQuery.length >= 2) {
      const results = searchClubs(visitingClubQuery).slice(0, 6);
      setVisitingClubResults(results);
    } else {
      setVisitingClubResults([]);
    }
  }, [visitingClubQuery]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        bowls_format: bowlsFormat,
        max_players: parseInt(maxPlayers) || 32,
        starts_at: startsAt || null,
      };

      if (isInterClub && visitingClub) {
        body.is_inter_club = true;
        body.visiting_club_id = visitingClub.id;
      }

      const res = await fetch("/api/bowls/tournament", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create tournament");
      }

      setName("");
      setBowlsFormat("fours");
      setMaxPlayers("32");
      setStartsAt("");
      setIsInterClub(false);
      setVisitingClub(null);
      setVisitingClubQuery("");
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-300 bg-white dark:bg-[#1a3d28] p-5 shadow-2xl max-h-[85vh] overflow-y-auto sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Create Bowls Tournament
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">Tournament Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saturday Social Draw"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                required
              />
            </div>

            <div data-onboarding-target="configure-format">
              <label className="mb-2 block text-sm font-medium text-zinc-400">Bowls Format</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_BOWLS_FORMATS.map((f) => {
                  const info = BOWLS_FORMAT_LABELS[f];
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setBowlsFormat(f)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-left",
                        bowlsFormat === f
                          ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                          : "border-zinc-200 bg-zinc-100 text-zinc-400 hover:border-zinc-400"
                      )}
                    >
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inter-Club Toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInterClub}
                  onChange={(e) => {
                    setIsInterClub(e.target.checked);
                    if (!e.target.checked) {
                      setVisitingClub(null);
                      setVisitingClubQuery("");
                    }
                  }}
                  className="h-4 w-4 rounded border-zinc-300 text-[#1B5E20] focus:ring-[#1B5E20]"
                />
                <span className="text-sm font-medium text-zinc-700">Inter-Club Match</span>
              </label>
              {isInterClub && (
                <div className="mt-2">
                  {visitingClub ? (
                    <div className="flex items-center gap-2 rounded-xl border border-[#1B5E20]/30 bg-[#1B5E20]/5 p-3">
                      <Building2 className="h-4 w-4 text-[#1B5E20]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{visitingClub.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{visitingClub.city}, {visitingClub.stateCode}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setVisitingClub(null);
                          setVisitingClubQuery("");
                        }}
                        className="text-zinc-400 hover:text-zinc-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={visitingClubQuery}
                          onChange={(e) => setVisitingClubQuery(e.target.value)}
                          placeholder="Search visiting club..."
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-100 pl-9 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                        />
                      </div>
                      {visitingClubResults.length > 0 && (
                        <div className="mt-1 max-h-36 overflow-y-auto rounded-lg border border-zinc-200 bg-white">
                          {visitingClubResults.map((club) => (
                            <button
                              key={club.id}
                              type="button"
                              onClick={() => {
                                setVisitingClub(club);
                                setVisitingClubQuery("");
                              }}
                              className="flex w-full items-center gap-2 border-b border-zinc-100 px-3 py-2 text-left text-sm last:border-0 hover:bg-zinc-50 dark:bg-white/5"
                            >
                              <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-zinc-900 truncate">{club.name}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{club.city}, {club.stateCode}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">Max Players</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  min={4}
                  max={64}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-zinc-900 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-400">Start Date</label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-zinc-900 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#1B5E20] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {loading ? "Creating..." : "Create Tournament"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
