"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { WaiverStatus } from "@/components/waiver/WaiverStatus";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileStatsSection } from "@/components/stats/ProfileStatsSection";
import { MatchHistory } from "@/components/profile/MatchHistory";
import { AvailabilitySchedule } from "@/components/profile/AvailabilitySchedule";
import { ClubAffiliations } from "@/components/profile/ClubAffiliations";
import { PhotoGallery } from "@/components/profile/PhotoGallery";
import { CompletenessBarWithData } from "@/components/profile/CompletenessBar";
import type { PlayerProfile, SkillLevel, Sport, BowlingPosition, PreferredHand } from "@/lib/db/players";
import type { Waiver } from "@/lib/db/waivers";
import type { PlayerPhoto } from "@/lib/db/gallery";
import type { PlayerStats, FavoritePartner } from "@/lib/types";
import { ArrowLeft, LogOut, Pencil } from "lucide-react";

interface ProfilePageClientProps {
  player: PlayerProfile;
  waiver: Waiver | null;
  stats: PlayerStats | null;
  favoritePartners: FavoritePartner[];
  photos: PlayerPhoto[];
}

export function ProfilePageClient({ player, waiver, stats, favoritePartners, photos: initialPhotos }: ProfilePageClientProps) {
  const [editing, setEditing] = useState(false);
  const [photos, setPhotos] = useState<PlayerPhoto[]>(initialPhotos);
  const router = useRouter();

  async function refreshPhotos() {
    try {
      const res = await fetch("/api/profile/gallery");
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch {
      // silent fail
    }
  }

  async function handleSubmit(data: {
    display_name: string;
    skill_level: SkillLevel;
    sports: Sport[];
    avatar_url: string | null;
    bio: string | null;
    preferred_position: BowlingPosition | null;
    preferred_hand: PreferredHand | null;
    years_experience: number | null;
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
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">My Profile</h1>

        <div className="mb-6">
          <WaiverStatus waiver={waiver} />
        </div>

        {editing ? (
          <div className="rounded-xl glass p-6">
            <ProfileForm
              player={player}
              onSubmit={handleSubmit}
              onAvatarUpload={handleAvatarUpload}
              submitLabel="Update Profile"
            />
            <button
              onClick={() => setEditing(false)}
              className="mt-3 w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-500 hover:bg-zinc-50 min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <CompletenessBarWithData player={player} waiver={waiver} />

            <ProfileCard player={player} />

            <ProfileStatsSection stats={stats} favoritePartners={favoritePartners} />

            <MatchHistory playerId={player.id} />

            <AvailabilitySchedule playerId={player.id} editable />

            <ClubAffiliations playerId={player.id} editable />

            <PhotoGallery photos={photos} editable onPhotosChange={refreshPhotos} />

            <button
              onClick={() => setEditing(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 min-h-[44px]"
            >
              <Pencil className="h-4 w-4" /> Edit Profile
            </button>

            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 min-h-[44px]"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
