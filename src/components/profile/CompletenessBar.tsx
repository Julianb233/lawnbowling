"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import type { PlayerProfile } from "@/lib/db/players";
import type { Waiver } from "@/lib/db/waivers";

interface CompletenessItem {
  key: string;
  label: string;
  weight: number;
  completed: boolean;
  suggestion: string;
}

interface CompletenessBarProps {
  player: PlayerProfile;
  waiver: Waiver | null;
  /** Pass extra completion data fetched from APIs */
  hasClubAffiliation?: boolean;
  hasAvailability?: boolean;
  hasPhotos?: boolean;
  /** Compact mode for dashboard/home */
  compact?: boolean;
}

function calculateItems(
  player: PlayerProfile,
  waiver: Waiver | null,
  hasClub: boolean,
  hasAvailability: boolean,
  hasPhotos: boolean,
): CompletenessItem[] {
  return [
    {
      key: "avatar",
      label: "Profile photo",
      weight: 15,
      completed: !!player.avatar_url,
      suggestion: "Upload a profile photo",
    },
    {
      key: "bio",
      label: "Bio",
      weight: 15,
      completed: !!player.bio,
      suggestion: "Write a short bio about yourself",
    },
    {
      key: "sports",
      label: "Sports",
      weight: 10,
      completed: player.sports.length > 0,
      suggestion: "Select your preferred sports",
    },
    {
      key: "skill_level",
      label: "Experience",
      weight: 10,
      completed: !!player.skill_level && player.skill_level !== "beginner",
      suggestion: "Set your experience level",
    },
    {
      key: "preferred_position",
      label: "Position",
      weight: 10,
      completed: !!player.preferred_position,
      suggestion: "Choose your preferred bowling position",
    },
    {
      key: "preferred_hand",
      label: "Preferred hand",
      weight: 5,
      completed: !!player.preferred_hand,
      suggestion: "Set your preferred hand",
    },
    {
      key: "years_experience",
      label: "Experience",
      weight: 5,
      completed: player.years_experience !== null && player.years_experience !== undefined,
      suggestion: "Add your years of experience",
    },
    {
      key: "club",
      label: "Club affiliation",
      weight: 10,
      completed: hasClub,
      suggestion: "Join a bowling club",
    },
    {
      key: "availability",
      label: "Availability",
      weight: 10,
      completed: hasAvailability,
      suggestion: "Set your weekly availability",
    },
    {
      key: "waiver",
      label: "Waiver signed",
      weight: 10,
      completed: !!waiver?.accepted,
      suggestion: "Sign your liability waiver",
    },
  ];
}

export function CompletenessBar({
  player,
  waiver,
  hasClubAffiliation = false,
  hasAvailability = false,
  hasPhotos = false,
  compact = false,
}: CompletenessBarProps) {
  const [expanded, setExpanded] = useState(false);

  const items = calculateItems(player, waiver, hasClubAffiliation, hasAvailability, hasPhotos);
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  const completedWeight = items
    .filter((i) => i.completed)
    .reduce((sum, i) => sum + i.weight, 0);
  const percentage = Math.round((completedWeight / totalWeight) * 100);
  const incomplete = items.filter((i) => !i.completed);

  if (percentage === 100 && compact) return null;

  const barColor =
    percentage === 100
      ? "bg-[#1B5E20]"
      : percentage >= 70
        ? "bg-[#1B5E20]/80"
        : percentage >= 40
          ? "bg-amber-500"
          : "bg-red-400";

  if (compact) {
    return (
      <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#2D4A30]">Profile</span>
          <span className="text-sm font-semibold text-[#0A2E12]">{percentage}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#0A2E12]/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {incomplete.length > 0 && (
          <p className="mt-2 text-xs text-[#3D5A3E]">
            {incomplete[0].suggestion}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-4">
      {percentage === 100 ? (
        <div className="flex items-center gap-2 text-[#1B5E20]">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-semibold">Profile complete!</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#2D4A30]">Profile Completeness</span>
            <span className="text-sm font-semibold text-[#0A2E12]">{percentage}%</span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-[#0A2E12]/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {incomplete.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 flex w-full items-center justify-between text-sm text-[#3D5A3E] hover:text-[#2D4A30] min-h-[44px]"
            >
              <span>{incomplete.length} item{incomplete.length !== 1 ? "s" : ""} remaining</span>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}

          {expanded && (
            <ul className="mt-2 space-y-2">
              {items.map((item) => (
                <li key={item.key} className="flex items-start gap-2">
                  {item.completed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1B5E20]" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#3D5A3E]" />
                  )}
                  <span
                    className={`text-sm ${
                      item.completed ? "text-[#3D5A3E] line-through" : "text-[#2D4A30]"
                    }`}
                  >
                    {item.completed ? item.label : item.suggestion}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

/** Self-fetching version that loads extra data from APIs */
export function CompletenessBarWithData({
  player,
  waiver,
  compact = false,
}: {
  player: PlayerProfile;
  waiver: Waiver | null;
  compact?: boolean;
}) {
  const [extras, setExtras] = useState({
    hasClub: false,
    hasAvailability: false,
    hasPhotos: false,
    loaded: false,
  });

  useEffect(() => {
    async function load() {
      try {
        const [clubsRes, availRes, photosRes] = await Promise.all([
          fetch(`/api/profile/clubs?player_id=${player.id}`).catch(() => null),
          fetch(`/api/profile/availability?player_id=${player.id}`).catch(() => null),
          fetch("/api/profile/gallery").catch(() => null),
        ]);

        const clubs = clubsRes?.ok ? await clubsRes.json() : [];
        const avail = availRes?.ok ? await availRes.json() : [];
        const photos = photosRes?.ok ? await photosRes.json() : [];

        setExtras({
          hasClub: Array.isArray(clubs) && clubs.length > 0,
          hasAvailability: Array.isArray(avail) && avail.length > 0,
          hasPhotos: Array.isArray(photos) && photos.length > 0,
          loaded: true,
        });
      } catch {
        setExtras((prev) => ({ ...prev, loaded: true }));
      }
    }
    load();
  }, [player.id]);

  return (
    <CompletenessBar
      player={player}
      waiver={waiver}
      hasClubAffiliation={extras.hasClub}
      hasAvailability={extras.hasAvailability}
      hasPhotos={extras.hasPhotos}
      compact={compact}
    />
  );
}
