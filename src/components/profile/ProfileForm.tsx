"use client";

import { useState } from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { AvatarUpload } from "./AvatarUpload";
import { SportsSelect } from "./SportsTags";
import type { PlayerProfile, SkillLevel, Sport } from "@/lib/db/players";

interface ProfileFormProps {
  player?: PlayerProfile | null;
  onSubmit: (data: {
    display_name: string;
    skill_level: SkillLevel;
    sports: Sport[];
    avatar_url: string | null;
  }) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<string>;
  submitLabel?: string;
}

export function ProfileForm({ player, onSubmit, onAvatarUpload, submitLabel = "Save Profile" }: ProfileFormProps) {
  const [name, setName] = useState(player?.display_name ?? "");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(player?.skill_level ?? "beginner");
  const [sports, setSports] = useState<Sport[]>(player?.sports ?? []);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(player?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (sports.length === 0) {
      setError("Select at least one sport");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({ display_name: name.trim(), skill_level: skillLevel, sports, avatar_url: avatarUrl });
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
        <label htmlFor="display_name" className="mb-1.5 block text-sm font-medium text-white/80">
          Display Name
        </label>
        <input
          id="display_name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px]"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/80">Skill Level</label>
        <Select.Root value={skillLevel} onValueChange={(v) => setSkillLevel(v as SkillLevel)}>
          <Select.Trigger className="inline-flex w-full items-center justify-between rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px]">
            <Select.Value />
            <Select.Icon>
              <ChevronDown className="h-4 w-4 text-white/40" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="overflow-hidden rounded-lg border border-white/20 bg-gray-900 shadow-xl">
              <Select.Viewport className="p-1">
                {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map((level) => (
                  <Select.Item
                    key={level}
                    value={level}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm text-white outline-none hover:bg-white/10 min-h-[44px]"
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
        <label className="mb-1.5 block text-sm font-medium text-white/80">Sports</label>
        <SportsSelect selected={sports} onChange={setSports} />
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 min-h-[44px]"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
