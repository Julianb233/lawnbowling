"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, Plus } from "lucide-react";
type EndorsementSkill =
  | "great_skip"
  | "reliable_lead"
  | "strong_second"
  | "accurate_draw"
  | "powerful_drive"
  | "good_sportsmanship"
  | "team_player"
  | "tactical_mind";

interface EndorsementCount {
  skill: EndorsementSkill;
  count: number;
}

const ENDORSEMENT_SKILLS: { id: EndorsementSkill; label: string }[] = [
  { id: "great_skip", label: "Great Skip" },
  { id: "reliable_lead", label: "Reliable Lead" },
  { id: "strong_second", label: "Strong Second" },
  { id: "accurate_draw", label: "Accurate Draw" },
  { id: "powerful_drive", label: "Powerful Drive" },
  { id: "good_sportsmanship", label: "Good Sportsmanship" },
  { id: "team_player", label: "Team Player" },
  { id: "tactical_mind", label: "Tactical Mind" },
];

interface EndorsementsProps {
  playerId: string;
  isOwnProfile: boolean;
  currentPlayerId: string | null;
}

export function Endorsements({ playerId, isOwnProfile, currentPlayerId }: EndorsementsProps) {
  const [counts, setCounts] = useState<EndorsementCount[]>([]);
  const [myEndorsements, setMyEndorsements] = useState<EndorsementSkill[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/profile/${playerId}/endorsements`);
        if (res.ok) {
          const data = await res.json();
          setCounts(data.counts);
          setMyEndorsements(data.myEndorsements);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [playerId]);

  async function toggleEndorsement(skill: EndorsementSkill) {
    const isEndorsed = myEndorsements.includes(skill);

    if (isEndorsed) {
      const res = await fetch(`/api/profile/${playerId}/endorsements?skill=${skill}`, { method: "DELETE" });
      if (res.ok) {
        setMyEndorsements((prev) => prev.filter((s) => s !== skill));
        setCounts((prev) => {
          const updated = prev.map((c) =>
            c.skill === skill ? { ...c, count: Math.max(0, c.count - 1) } : c
          );
          return updated.filter((c) => c.count > 0);
        });
      }
    } else {
      const res = await fetch(`/api/profile/${playerId}/endorsements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill }),
      });
      if (res.ok) {
        setMyEndorsements((prev) => [...prev, skill]);
        setCounts((prev) => {
          const existing = prev.find((c) => c.skill === skill);
          if (existing) {
            return prev
              .map((c) => (c.skill === skill ? { ...c, count: c.count + 1 } : c))
              .sort((a, b) => b.count - a.count);
          }
          return [...prev, { skill, count: 1 }].sort((a, b) => b.count - a.count);
        });
        setShowPicker(false);
      }
    }
  }

  if (loading) return null;

  const skillLabel = (id: EndorsementSkill) =>
    ENDORSEMENT_SKILLS.find((s) => s.id === id)?.label ?? id;

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-[#3D5A3E]">Endorsements</h2>

      {counts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {counts.map(({ skill, count }) => {
            const endorsed = myEndorsements.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => !isOwnProfile && currentPlayerId && toggleEndorsement(skill)}
                disabled={isOwnProfile || !currentPlayerId}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  endorsed
                    ? "bg-[#1B5E20] text-white"
                    : "bg-[#0A2E12]/5 text-[#2D4A30] hover:bg-[#0A2E12]/5"
                } ${isOwnProfile || !currentPlayerId ? "cursor-default" : "cursor-pointer"}`}
              >
                <ThumbsUp className="h-3 w-3" />
                {skillLabel(skill)}
                <span className="ml-0.5 text-[10px] opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-[#3D5A3E]">No endorsements yet</p>
      )}

      {!isOwnProfile && currentPlayerId && !showPicker && (
        <button
          onClick={() => setShowPicker(true)}
          className="mt-3 inline-flex items-center gap-1 rounded-lg border border-[#0A2E12]/10 px-3 py-1.5 text-xs font-medium text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03]"
        >
          <Plus className="h-3 w-3" /> Endorse
        </button>
      )}

      {showPicker && (
        <div className="mt-3 rounded-lg border border-[#0A2E12]/10 bg-white p-3">
          <p className="mb-2 text-xs font-medium text-[#3D5A3E]">Select a skill to endorse</p>
          <div className="flex flex-wrap gap-1.5">
            {ENDORSEMENT_SKILLS.map((s) => {
              const alreadyEndorsed = myEndorsements.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleEndorsement(s.id)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                    alreadyEndorsed
                      ? "bg-[#1B5E20] text-white"
                      : "bg-[#0A2E12]/5 text-[#2D4A30] hover:bg-[#0A2E12]/5"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowPicker(false)}
            className="mt-2 text-xs text-[#3D5A3E] hover:text-[#3D5A3E]"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
