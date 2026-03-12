export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerById, getPlayerByUserId } from "@/lib/db/players";
import { getWaiverByPlayerId } from "@/lib/db/waivers";
import { getPlayerStats, getFavoritePartners } from "@/lib/db/stats";
import { isFavorite } from "@/lib/db/favorites";
import { WaiverStatus } from "@/components/waiver/WaiverStatus";
import { SportsTags } from "@/components/profile/SportsTags";
import { SkillBadge } from "@/components/profile/SkillBadge";
import { FavoriteButton } from "@/components/social/FavoriteButton";
import { AddFriendButton } from "@/components/social/AddFriendButton";
import { ProfileStatsSection } from "@/components/stats/ProfileStatsSection";
import { MatchHistory } from "@/components/profile/MatchHistory";
import { AvailabilitySchedule } from "@/components/profile/AvailabilitySchedule";
import { ClubAffiliations } from "@/components/profile/ClubAffiliations";
import { PhotoGalleryReadonly } from "@/components/profile/PhotoGallery";
import { getPlayerPhotos } from "@/lib/db/gallery";
import { getContactPreferences } from "@/lib/db/contact-preferences";
import { ContactInfo } from "@/components/profile/ContactPreferences";
import { getPlayerAchievements } from "@/lib/db/achievements";
import { AchievementBadges } from "@/components/profile/AchievementBadges";
import { Endorsements } from "@/components/profile/Endorsements";
import { ProfileClubBadge } from "@/components/clubs/ProfileClubBadge";
import { BowlsRatingsCard } from "@/components/stats/BowlsRatingsCard";
import * as Avatar from "@radix-ui/react-avatar";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Shield } from "lucide-react";

const CLUB_BANNERS = [
  "/images/scenery-clubhouse-dusk.jpg",
  "/images/scenery-golden-hour-green.jpg",
  "/images/scenery-morning-dew-green.jpg",
  "/images/heritage-clubhouse-tea.jpg",
  "/images/heritage-wooden-bench-green.jpg",
  "/images/clubhouse-golden.png",
];

function getBannerForPlayer(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return CLUB_BANNERS[Math.abs(hash) % CLUB_BANNERS.length];
}

async function getFriendshipStatus(currentPlayerId: string, targetPlayerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("friendships")
    .select("status")
    .or(
      `and(player_id.eq.${currentPlayerId},friend_id.eq.${targetPlayerId}),and(player_id.eq.${targetPlayerId},friend_id.eq.${currentPlayerId})`
    )
    .maybeSingle();

  return (data?.status as "none" | "pending" | "accepted" | "blocked") ?? "none";
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let player;
  try {
    player = await getPlayerById(id);
  } catch {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPlayer = user ? await getPlayerByUserId(user.id) : null;
  const isOwnProfile = currentPlayer?.id === player.id;

  const [waiver, favorited, friendStatus, stats, favoritePartners, photos, achievements, contactPrefs] = await Promise.all([
    getWaiverByPlayerId(player.id),
    currentPlayer && !isOwnProfile
      ? isFavorite(currentPlayer.id, player.id)
      : false,
    currentPlayer && !isOwnProfile
      ? getFriendshipStatus(currentPlayer.id, player.id)
      : ("none" as const),
    getPlayerStats(player.id),
    getFavoritePartners(player.id, { limit: 5 }),
    getPlayerPhotos(player.id),
    getPlayerAchievements(player.id),
    getContactPreferences(player.id),
  ]);

  const initials = player.display_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const bannerSrc = getBannerForPlayer(player.display_name);

  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      {/* Club photo hero banner */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={bannerSrc}
          alt="Club banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2E12]/60 to-[#0A2E12]/30" />
        <div className="absolute top-4 left-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#A8D5BA] hover:text-white min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Board
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 -mt-12 relative z-10 pb-8">
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <Avatar.Root className="mb-4 inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-zinc-100 ring-4 ring-[#FEFCF9] shadow-lg">
              <Avatar.Image
                src={player.avatar_url ?? undefined}
                alt={player.display_name}
                className="h-full w-full object-cover"
              />
              <Avatar.Fallback className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#3D5A3E]">
                {initials}
              </Avatar.Fallback>
            </Avatar.Root>

            <h1 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[#0A2E12]">
              {player.display_name}
              {player.insurance_status === "active" ? (
                <ShieldCheck className="h-5 w-5 text-green-600" />
              ) : (
                <Shield className="h-5 w-5 text-[#0A2E12]/20" />
              )}
            </h1>

            <div className="mt-2">
              <SkillBadge level={player.skill_level} />
            </div>

            <ProfileClubBadge
              clubId={player.home_club_id ?? null}
              isOwnProfile={isOwnProfile}
            />

            {currentPlayer && !isOwnProfile && (
              <div className="mt-4 flex items-center gap-3">
                <AddFriendButton
                  targetId={player.id}
                  status={friendStatus}
                />
                <FavoriteButton
                  playerId={currentPlayer.id}
                  favoriteId={player.id}
                  isFavorited={favorited}
                />
              </div>
            )}
          </div>

          {player.bio && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-[#3D5A3E]">About</h2>
              <p className="text-sm text-[#2D4A30] whitespace-pre-line">{player.bio}</p>
            </div>
          )}

          {(player.preferred_position || player.preferred_hand || player.years_experience !== null) && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-[#3D5A3E]">Preferences</h2>
              <div className="flex flex-wrap gap-2">
                {player.preferred_position && (
                  <span className="inline-flex items-center rounded-full bg-[#1B5E20]/10 px-3 py-1 text-xs font-medium text-[#1B5E20]">
                    {player.preferred_position.charAt(0).toUpperCase() + player.preferred_position.slice(1)}
                  </span>
                )}
                {player.preferred_hand && (
                  <span className="inline-flex items-center rounded-full bg-[#1B5E20]/10 px-3 py-1 text-xs font-medium text-[#1B5E20]">
                    {player.preferred_hand.charAt(0).toUpperCase() + player.preferred_hand.slice(1)}
                  </span>
                )}
                {player.years_experience !== null && (
                  <span className="inline-flex items-center rounded-full bg-[#1B5E20]/10 px-3 py-1 text-xs font-medium text-[#1B5E20]">
                    {player.years_experience} {player.years_experience === 1 ? "year" : "years"} experience
                  </span>
                )}
              </div>
            </div>
          )}

          {player.sports.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-[#3D5A3E]">Sports</h2>
              <SportsTags sports={player.sports} />
            </div>
          )}

          <ProfileStatsSection stats={stats} favoritePartners={favoritePartners} />

          {player.sports.includes("lawn_bowling") && (
            <BowlsRatingsCard playerId={player.id} />
          )}

          <AchievementBadges achievements={achievements} />

          <Endorsements
            playerId={player.id}
            isOwnProfile={isOwnProfile}
            currentPlayerId={currentPlayer?.id ?? null}
          />

          <PhotoGalleryReadonly photos={photos} />

          <MatchHistory playerId={player.id} />

          <AvailabilitySchedule playerId={player.id} />

          <ClubAffiliations playerId={player.id} />

          <ContactInfo prefs={contactPrefs} />

          <div>
            <h2 className="mb-2 text-sm font-medium text-[#3D5A3E]">Waiver Status</h2>
            <WaiverStatus waiver={waiver} />
          </div>

          <p className="text-center text-xs text-[#3D5A3E]">
            Member since {new Date(player.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
          </p>
        </div>
      </div>
    </div>
  );
}
