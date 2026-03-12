"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { WaiverStatus } from "@/components/waiver/WaiverStatus";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileStatsSection } from "@/components/stats/ProfileStatsSection";
import { MatchHistory } from "@/components/profile/MatchHistory";
import { AvailabilitySchedule } from "@/components/profile/AvailabilitySchedule";
import { ClubAffiliations } from "@/components/profile/ClubAffiliations";
import { PhotoGallery } from "@/components/profile/PhotoGallery";
import { CompletenessBarWithData } from "@/components/profile/CompletenessBar";
import { FadeIn } from "@/components/motion/FadeIn";
import type { PlayerProfile, SkillLevel, Sport, BowlingPosition, PreferredHand } from "@/lib/db/players";
import type { Waiver } from "@/lib/db/waivers";
import type { PlayerPhoto } from "@/lib/db/gallery";
import type { PlayerStats, FavoritePartner } from "@/lib/types";
import { ArrowLeft, LogOut, Pencil, MessageCircle, Users } from "lucide-react";
import Link from "next/link";

/** Club banner photos — rotated based on player name hash */
const CLUB_BANNERS = [
  { src: "/images/scenery-clubhouse-dusk.jpg", alt: "Bowling clubhouse at dusk" },
  { src: "/images/scenery-golden-hour-green.jpg", alt: "Golden hour on the green" },
  { src: "/images/scenery-morning-dew-green.jpg", alt: "Morning dew on the bowling green" },
  { src: "/images/heritage-clubhouse-tea.jpg", alt: "Clubhouse tea time" },
  { src: "/images/heritage-wooden-bench-green.jpg", alt: "Wooden bench by the green" },
  { src: "/images/clubhouse-golden.png", alt: "Clubhouse at golden hour" },
];

function getBannerForPlayer(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return CLUB_BANNERS[Math.abs(hash) % CLUB_BANNERS.length];
}

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
  const banner = getBannerForPlayer(player.display_name);

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
    <div className="min-h-screen bg-[#FEFCF9]">
      {/* Club photo hero banner */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={banner.src}
          alt={banner.alt}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2E12]/60 to-[#0A2E12]/30" />
        <div className="absolute inset-0 flex items-end px-4 pb-4">
          <div className="mx-auto w-full max-w-md">
            <button
              onClick={() => router.back()}
              className="mb-3 inline-flex items-center gap-1 text-sm text-[#A8D5BA] hover:text-white min-h-[44px]"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white tracking-tight">
              My Profile
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 -mt-4 relative z-10 pb-28">
        {/* Quick action links */}
        <FadeIn>
          <div className="mb-4 flex gap-2">
            <Link
              href="/friends"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white border border-[#0A2E12]/10 px-4 py-3 text-sm font-medium text-[#1B5E20] hover:bg-[#F0FFF4] transition-colors min-h-[44px] shadow-sm"
            >
              <Users className="h-4 w-4" /> Friends
            </Link>
            <Link
              href="/chat"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white border border-[#0A2E12]/10 px-4 py-3 text-sm font-medium text-[#1B5E20] hover:bg-[#F0FFF4] transition-colors min-h-[44px] shadow-sm"
            >
              <MessageCircle className="h-4 w-4" /> Messages
            </Link>
          </div>
        </FadeIn>

        <div className="mb-4">
          <WaiverStatus waiver={waiver} />
        </div>

        {editing ? (
          <div className="rounded-xl bg-white border border-[#0A2E12]/10 p-6 shadow-sm">
            <ProfileForm
              player={player}
              onSubmit={handleSubmit}
              onAvatarUpload={handleAvatarUpload}
              submitLabel="Update Profile"
            />
            <button
              onClick={() => setEditing(false)}
              className="mt-3 w-full rounded-lg border border-[#0A2E12]/10 px-4 py-3 text-sm text-[#3D5A3E] hover:bg-[#F0FFF4] min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <FadeIn>
              <CompletenessBarWithData player={player} waiver={waiver} />
            </FadeIn>

            <FadeIn delay={0.05}>
              <ProfileCard player={player} />
            </FadeIn>

            <FadeIn delay={0.1}>
              <ProfileStatsSection stats={stats} favoritePartners={favoritePartners} />
            </FadeIn>

            <FadeIn delay={0.15}>
              <MatchHistory playerId={player.id} />
            </FadeIn>

            <FadeIn delay={0.2}>
              <AvailabilitySchedule playerId={player.id} editable />
            </FadeIn>

            <FadeIn delay={0.25}>
              <ClubAffiliations playerId={player.id} editable />
            </FadeIn>

            <FadeIn delay={0.3}>
              <PhotoGallery photos={photos} editable onPhotosChange={refreshPhotos} />
            </FadeIn>

            <button
              onClick={() => setEditing(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-3 text-sm font-medium text-[#0A2E12] hover:bg-[#F0FFF4] min-h-[44px] shadow-sm"
            >
              <Pencil className="h-4 w-4" /> Edit Profile
            </button>

            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 min-h-[44px]"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
