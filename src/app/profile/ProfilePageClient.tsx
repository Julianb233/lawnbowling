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
import { ArrowLeft, LogOut, Pencil, MessageCircle, Users, Award, Star, Trophy } from "lucide-react";
import Link from "next/link";

/** Club banner photos -- rotated based on player name hash */
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

  const initials = player.display_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSinceYear = new Date(player.created_at).getFullYear();

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
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 -mt-16 relative z-10 pb-28">
        {/* Baseball-card style profile header */}
        <FadeIn>
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm text-center">
            {/* Large circular photo with gold border ring */}
            <div className="mx-auto -mt-16 mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#FEFCF9] shadow-lg"
              style={{ border: "4px solid #B8860B" }}
            >
              {player.avatar_url ? (
                <img
                  src={player.avatar_url}
                  alt={player.display_name}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <span
                  className="text-3xl font-bold"
                  style={{ color: "#3D5A3E" }}
                >
                  {initials}
                </span>
              )}
            </div>

            {/* Name in Playfair Display */}
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              {player.display_name}
            </h1>

            {/* Club name */}
            {player.home_club_id && (
              <p className="mt-1 text-sm" style={{ color: "#3D5A3E" }}>
                Home Club Member
              </p>
            )}

            {/* Member since */}
            <p className="mt-1 text-xs" style={{ color: "#3D5A3E" }}>
              Member since {memberSinceYear}
            </p>

            {/* Position badges */}
            {(player.preferred_position || player.preferred_hand) && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {player.preferred_position && (
                  <span className="inline-flex items-center rounded-full bg-[#1B5E20] px-3 py-1 text-xs font-medium text-white">
                    {player.preferred_position.charAt(0).toUpperCase() + player.preferred_position.slice(1)}
                  </span>
                )}
                {player.preferred_hand && (
                  <span className="inline-flex items-center rounded-full bg-[#1B5E20] px-3 py-1 text-xs font-medium text-white">
                    {player.preferred_hand.charAt(0).toUpperCase() + player.preferred_hand.slice(1)}-handed
                  </span>
                )}
                {player.years_experience !== null && player.years_experience > 0 && (
                  <span className="inline-flex items-center rounded-full bg-[#1B5E20] px-3 py-1 text-xs font-medium text-white">
                    {player.years_experience}yr exp
                  </span>
                )}
              </div>
            )}

            {/* Stats card */}
            {stats && (
              <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] p-4">
                <div className="text-center">
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
                  >
                    {stats.games_played ?? 0}
                  </p>
                  <p className="text-xs" style={{ color: "#3D5A3E" }}>
                    Matches
                  </p>
                </div>
                <div className="text-center">
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
                  >
                    {stats.win_rate != null ? `${Math.round(stats.win_rate)}%` : "--"}
                  </p>
                  <p className="text-xs" style={{ color: "#3D5A3E" }}>
                    Win Rate
                  </p>
                </div>
                <div className="text-center">
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
                  >
                    {stats.wins ?? 0}
                  </p>
                  <p className="text-xs" style={{ color: "#3D5A3E" }}>
                    Wins
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex gap-3">
              <Link
                href="/chat"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#145218] min-h-[44px]"
              >
                <MessageCircle className="h-4 w-4" /> Message
              </Link>
              <Link
                href="/friends"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#0A2E12]/10 bg-white px-6 py-3 text-sm font-bold transition hover:bg-[#FEFCF9] min-h-[44px]"
                style={{ color: "#1B5E20" }}
              >
                <Users className="h-4 w-4" /> Friends
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Skill Endorsements placeholder */}
        <FadeIn delay={0.05}>
          <div className="mt-4 rounded-2xl border border-[#0A2E12]/10 bg-white p-5 shadow-sm">
            <h2
              className="mb-3 text-lg font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              Skill Endorsements
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1B5E20]/10 px-3 py-1.5 text-xs font-medium" style={{ color: "#1B5E20" }}>
                <Star className="h-3 w-3" /> Consistent Draw
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1B5E20]/10 px-3 py-1.5 text-xs font-medium" style={{ color: "#1B5E20" }}>
                <Star className="h-3 w-3" /> Team Player
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1B5E20]/10 px-3 py-1.5 text-xs font-medium" style={{ color: "#1B5E20" }}>
                <Star className="h-3 w-3" /> Great Skip
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Honours & Badges */}
        <FadeIn delay={0.1}>
          <div className="mt-4 rounded-2xl border border-[#0A2E12]/10 bg-white p-5 shadow-sm">
            <h2
              className="mb-3 text-lg font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              Honours & Badges
            </h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-[#B8860B]/30 bg-[#B8860B]/5 px-3 py-2">
                <Trophy className="h-5 w-5" style={{ color: "#B8860B" }} />
                <span className="text-sm font-medium" style={{ color: "#0A2E12" }}>
                  Club Champion
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[#B8860B]/30 bg-[#B8860B]/5 px-3 py-2">
                <Award className="h-5 w-5" style={{ color: "#B8860B" }} />
                <span className="text-sm font-medium" style={{ color: "#0A2E12" }}>
                  Century Maker
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="mt-4 mb-4">
          <WaiverStatus waiver={waiver} />
        </div>

        {editing ? (
          <div className="rounded-2xl bg-white border border-[#0A2E12]/10 p-6 shadow-sm">
            <ProfileForm
              player={player}
              onSubmit={handleSubmit}
              onAvatarUpload={handleAvatarUpload}
              submitLabel="Update Profile"
            />
            <button
              onClick={() => setEditing(false)}
              className="mt-3 w-full rounded-xl border border-[#0A2E12]/10 px-6 py-3 text-sm font-bold hover:bg-[#FEFCF9] min-h-[44px]"
              style={{ color: "#3D5A3E" }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <FadeIn delay={0.15}>
              <CompletenessBarWithData player={player} waiver={waiver} />
            </FadeIn>

            <FadeIn delay={0.2}>
              <ProfileCard player={player} />
            </FadeIn>

            <FadeIn delay={0.25}>
              <ProfileStatsSection stats={stats} favoritePartners={favoritePartners} />
            </FadeIn>

            <FadeIn delay={0.3}>
              <MatchHistory playerId={player.id} />
            </FadeIn>

            <FadeIn delay={0.35}>
              <AvailabilitySchedule playerId={player.id} editable />
            </FadeIn>

            <FadeIn delay={0.4}>
              <ClubAffiliations playerId={player.id} editable />
            </FadeIn>

            <FadeIn delay={0.45}>
              <PhotoGallery photos={photos} editable onPhotosChange={refreshPhotos} />
            </FadeIn>

            <button
              onClick={() => setEditing(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0A2E12]/10 bg-white px-6 py-3 text-sm font-bold hover:bg-[#FEFCF9] min-h-[44px] shadow-sm"
              style={{ color: "#0A2E12" }}
            >
              <Pencil className="h-4 w-4" /> Edit Profile
            </button>

            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 min-h-[44px]"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
