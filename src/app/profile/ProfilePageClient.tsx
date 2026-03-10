"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { WaiverStatus } from "@/components/waiver/WaiverStatus";
import { ProfileCard } from "@/components/profile/ProfileCard";
import type { PlayerProfile, SkillLevel, Sport } from "@/lib/db/players";
import type { Waiver } from "@/lib/db/waivers";
import { ArrowLeft, Pencil } from "lucide-react";

interface ProfilePageClientProps {
  player: PlayerProfile;
  waiver: Waiver | null;
}

export function ProfilePageClient({ player, waiver }: ProfilePageClientProps) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  async function handleSubmit(data: {
    display_name: string;
    skill_level: SkillLevel;
    sports: Sport[];
    avatar_url: string | null;
  }) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update profile");
    }

    setEditing(false);
    router.refresh();
  }

  async function handleAvatarUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload avatar");
    const { url } = await res.json();
    return url;
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="mb-6 text-2xl font-bold text-white">My Profile</h1>

        <div className="mb-6">
          <WaiverStatus waiver={waiver} />
        </div>

        {editing ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <ProfileForm
              player={player}
              onSubmit={handleSubmit}
              onAvatarUpload={handleAvatarUpload}
              submitLabel="Update Profile"
            />
            <button
              onClick={() => setEditing(false)}
              className="mt-3 w-full rounded-lg border border-white/20 px-4 py-3 text-sm text-white/60 hover:bg-white/5 min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <ProfileCard player={player} />
            <button
              onClick={() => setEditing(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 min-h-[44px]"
            >
              <Pencil className="h-4 w-4" /> Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
