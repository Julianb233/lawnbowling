"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Crown, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PickerPlayer {
  id: string;
  name: string;
  avatar_url: string | null;
  skill_level: string;
}

type PickMode = "captain" | "random" | "balanced";

interface TeamPickerProps {
  players: PickerPlayer[];
  onTeamsSet: (team1: PickerPlayer[], team2: PickerPlayer[]) => void;
}

function getSkillValue(level: string): number {
  return level === "advanced" ? 3 : level === "intermediate" ? 2 : 1;
}

export function TeamPicker({ players, onTeamsSet }: TeamPickerProps) {
  const [mode, setMode] = useState<PickMode>("random");
  const [team1, setTeam1] = useState<PickerPlayer[]>([]);
  const [team2, setTeam2] = useState<PickerPlayer[]>([]);
  const [pool, setPool] = useState<PickerPlayer[]>(players);
  const [pickingTeam, setPickingTeam] = useState<1 | 2>(1);

  function handleRandom() {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const half = Math.ceil(shuffled.length / 2);
    const t1 = shuffled.slice(0, half);
    const t2 = shuffled.slice(half);
    setTeam1(t1);
    setTeam2(t2);
    setPool([]);
  }

  function handleBalanced() {
    const sorted = [...players].sort((a, b) => getSkillValue(b.skill_level) - getSkillValue(a.skill_level));
    const t1: PickerPlayer[] = [];
    const t2: PickerPlayer[] = [];
    let t1Score = 0;
    let t2Score = 0;

    for (const p of sorted) {
      const val = getSkillValue(p.skill_level);
      if (t1Score <= t2Score && t1.length <= t2.length) {
        t1.push(p);
        t1Score += val;
      } else {
        t2.push(p);
        t2Score += val;
      }
    }

    setTeam1(t1);
    setTeam2(t2);
    setPool([]);
  }

  function handlePick(player: PickerPlayer) {
    if (mode !== "captain") return;
    if (pickingTeam === 1) {
      setTeam1((prev) => [...prev, player]);
      setPickingTeam(2);
    } else {
      setTeam2((prev) => [...prev, player]);
      setPickingTeam(1);
    }
    setPool((prev) => prev.filter((p) => p.id !== player.id));
  }

  function handleReset() {
    setTeam1([]);
    setTeam2([]);
    setPool(players);
    setPickingTeam(1);
  }

  function handleConfirm() {
    onTeamsSet(team1, team2);
  }

  const modes: { value: PickMode; label: string; icon: React.ReactNode }[] = [
    { value: "captain", label: "Draft", icon: <Crown className="h-4 w-4" /> },
    { value: "random", label: "Random", icon: <Shuffle className="h-4 w-4" /> },
    { value: "balanced", label: "Balanced", icon: <Zap className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => {
              setMode(m.value);
              handleReset();
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all",
              mode === m.value
                ? "bg-[#1B5E20] text-white"
                : "bg-zinc-100 text-zinc-400 hover:text-zinc-700"
            )}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Auto-assign buttons */}
      {mode !== "captain" && pool.length > 0 && (
        <button
          onClick={mode === "random" ? handleRandom : handleBalanced}
          className="w-full rounded-xl bg-[#1B5E20]/10 py-3 text-sm font-semibold text-[#1B5E20] transition-colors hover:bg-[#1B5E20]/20"
        >
          {mode === "random" ? "Shuffle Teams" : "Auto-Balance"}
        </button>
      )}

      {/* Draft pool */}
      {mode === "captain" && pool.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
            Team {pickingTeam} picks:
          </p>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {pool.map((p) => (
                <motion.button
                  key={p.id}
                  layout
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => handlePick(p)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all",
                    pickingTeam === 1
                      ? "border-[#1B5E20]/30 hover:bg-[#1B5E20]/10"
                      : "border-red-500/30 hover:bg-red-500/10"
                  )}
                >
                  <div className="h-6 w-6 overflow-hidden rounded-full bg-zinc-700">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                        {p.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-zinc-700">{p.name}</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Teams display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#1B5E20]/20 bg-[#1B5E20]/5 p-3">
          <h4 className="mb-2 text-sm font-bold text-blue-400">Team 1</h4>
          <div className="space-y-1.5">
            {team1.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="h-5 w-5 overflow-hidden rounded-full bg-zinc-700">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
                      {p.name?.charAt(0)}
                    </div>
                  )}
                </div>
                {p.name}
              </div>
            ))}
            {team1.length === 0 && <p className="text-xs text-zinc-600 dark:text-zinc-400">No players</p>}
          </div>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <h4 className="mb-2 text-sm font-bold text-red-400">Team 2</h4>
          <div className="space-y-1.5">
            {team2.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="h-5 w-5 overflow-hidden rounded-full bg-zinc-700">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
                      {p.name?.charAt(0)}
                    </div>
                  )}
                </div>
                {p.name}
              </div>
            ))}
            {team2.length === 0 && <p className="text-xs text-zinc-600 dark:text-zinc-400">No players</p>}
          </div>
        </div>
      </div>

      {/* Confirm / Reset */}
      {(team1.length > 0 || team2.length > 0) && (
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-700"
          >
            Reset
          </button>
          <button
            onClick={handleConfirm}
            disabled={team1.length === 0 || team2.length === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B5E20] py-2.5 text-sm font-semibold text-white hover:bg-[#1B5E20] disabled:opacity-50"
          >
            Confirm <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
