"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerSportSkill, SportSkillLevel } from "@/lib/types";

interface SportSkillEditorProps {
  playerId: string;
  sports: string[];
}

const SKILL_LEVELS: { value: SportSkillLevel; label: string; stars: number }[] = [
  { value: "beginner", label: "Beginner", stars: 1 },
  { value: "intermediate", label: "Intermediate", stars: 2 },
  { value: "advanced", label: "Advanced", stars: 3 },
  { value: "expert", label: "Expert", stars: 4 },
];

export function SportSkillEditor({ playerId, sports }: SportSkillEditorProps) {
  const [skills, setSkills] = useState<PlayerSportSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/profile/skills?player_id=${playerId}`);
        if (res.ok) {
          const data = await res.json();
          setSkills(data);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [playerId]);

  async function handleSetSkill(sport: string, level: SportSkillLevel) {
    setSaving(sport);
    try {
      const res = await fetch("/api/profile/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, skill_level: level }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSkills((prev) => {
          const existing = prev.findIndex((s) => s.sport === sport);
          if (existing >= 0) {
            const next = [...prev];
            next[existing] = updated;
            return next;
          }
          return [...prev, updated];
        });
      }
    } catch {
      // Handle error
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return <div className="animate-pulse rounded-xl bg-zinc-800 h-32" />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Skill per Sport</h3>
      {sports.map((sport) => {
        const skill = skills.find((s) => s.sport === sport);
        const currentLevel = skill?.skill_level || "beginner";
        const rating = skill?.rating || 1000;

        return (
          <motion.div
            key={sport}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl glass p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-200 capitalize">
                {sport.replace("_", " ")}
              </span>
              <span className="text-xs text-zinc-500">ELO: {Math.round(rating)}</span>
            </div>
            <div className="flex gap-2">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleSetSkill(sport, level.value)}
                  disabled={saving === sport}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs transition-colors min-h-[60px]",
                    currentLevel === level.value
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600"
                  )}
                >
                  {saving === sport ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <div className="flex gap-0.5">
                      {Array.from({ length: level.stars }, (_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  )}
                  <span className="hidden sm:inline">{level.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
