"use client";

import { useState } from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { AvatarUpload } from "./AvatarUpload";
import type { PlayerProfile, SkillLevel, Sport, BowlingPosition, PreferredHand } from "@/lib/db/players";

interface ProfileFormProps {
  player?: PlayerProfile | null;
  onSubmit: (data: {
    display_name: string;
    skill_level: SkillLevel;
    sports: Sport[];
    avatar_url: string | null;
    bio: string | null;
    preferred_position: BowlingPosition | null;
    preferred_hand: PreferredHand | null;
    years_experience: number | null;
  }) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<string>;
  submitLabel?: string;
}

export function ProfileForm({ player, onSubmit, onAvatarUpload, submitLabel = "Save Profile" }: ProfileFormProps) {
  const [name, setName] = useState(player?.display_name ?? "");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(player?.skill_level ?? "beginner");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(player?.avatar_url ?? null);
  const [bio, setBio] = useState(player?.bio ?? "");
  const [preferredPosition, setPreferredPosition] = useState<BowlingPosition | "">(player?.preferred_position ?? "");
  const [preferredHand, setPreferredHand] = useState<PreferredHand | "">(player?.preferred_hand ?? "");
  const [yearsExperience, setYearsExperience] = useState<string>(player?.years_experience?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        display_name: name.trim(),
        skill_level: skillLevel,
        sports: ["lawn_bowling"] as Sport[],
        avatar_url: avatarUrl,
        bio: bio.trim() || null,
        preferred_position: preferredPosition || null,
        preferred_hand: preferredHand || null,
        years_experience: yearsExperience ? parseInt(yearsExperience, 10) : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    const url = await onAvatarUpload(file);
    setAvatarUrl(url);
    return url;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-center">
        <AvatarUpload
          currentUrl={avatarUrl}
          displayName={name || "Player"}
          onUpload={handleAvatarUpload}
        />
      </div>

      <div>
        <label htmlFor="display_name" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Display Name
        </label>
        <input
          id="display_name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20] min-h-[44px]"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Skill Level</label>
        <Select.Root value={skillLevel} onValueChange={(v) => setSkillLevel(v as SkillLevel)}>
          <Select.Trigger className="inline-flex w-full items-center justify-between rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-zinc-900 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20] min-h-[44px]">
            <Select.Value />
            <Select.Icon>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-xl">
              <Select.Viewport className="p-1">
                {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map((level) => (
                  <Select.Item
                    key={level}
                    value={level}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm text-zinc-900 outline-none hover:bg-zinc-50 min-h-[44px]"
                  >
                    <Select.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                    <Select.ItemText>{level.charAt(0).toUpperCase() + level.slice(1)}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 500))}
          placeholder="Tell others about yourself..."
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20] resize-none"
        />
        <p className="mt-1 text-xs text-zinc-400">{bio.length}/500</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Preferred Position</label>
        <Select.Root value={preferredPosition} onValueChange={(v) => setPreferredPosition(v as BowlingPosition)}>
          <Select.Trigger className="inline-flex w-full items-center justify-between rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-zinc-900 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20] min-h-[44px]">
            <Select.Value placeholder="Select position" />
            <Select.Icon>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-xl">
              <Select.Viewport className="p-1">
                {(["lead", "second", "third", "skip"] as BowlingPosition[]).map((pos) => (
                  <Select.Item
                    key={pos}
                    value={pos}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm text-zinc-900 outline-none hover:bg-zinc-50 min-h-[44px]"
                  >
                    <Select.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                    <Select.ItemText>{pos.charAt(0).toUpperCase() + pos.slice(1)}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Preferred Hand</label>
        <Select.Root value={preferredHand} onValueChange={(v) => setPreferredHand(v as PreferredHand)}>
          <Select.Trigger className="inline-flex w-full items-center justify-between rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-zinc-900 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20] min-h-[44px]">
            <Select.Value placeholder="Select hand" />
            <Select.Icon>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-xl">
              <Select.Viewport className="p-1">
                {(["left", "right", "ambidextrous"] as PreferredHand[]).map((hand) => (
                  <Select.Item
                    key={hand}
                    value={hand}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm text-zinc-900 outline-none hover:bg-zinc-50 min-h-[44px]"
                  >
                    <Select.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                    <Select.ItemText>{hand.charAt(0).toUpperCase() + hand.slice(1)}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div>
        <label htmlFor="years_experience" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Years of Experience
        </label>
        <input
          id="years_experience"
          type="number"
          min="0"
          max="99"
          value={yearsExperience}
          onChange={(e) => setYearsExperience(e.target.value)}
          placeholder="e.g. 5"
          className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20] min-h-[44px]"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-[#1B5E20] px-4 py-3 font-medium text-white transition-colors hover:bg-[#1B5E20] disabled:opacity-50 min-h-[44px]"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
