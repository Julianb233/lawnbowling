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
import { ArrowLeft, ShieldCheck, Shield, MessageCircle } from "lucide-react";

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
  const memberSinceYear = new Date(player.created_at).getFullYear();

  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      {/* Club photo hero banner */}
      <div className="relative h-48 w-full overflow-hidden">
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

      <div className="mx-auto max-w-md px-4 -mt-16 relative z-10 pb-8">
        <div className="space-y-4">
          {/* Baseball-card style profile header */}
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm text-center">
            {/* Large circular photo with gold border ring */}
            <div className="mx-auto -mt-16 mb-4">
              <Avatar.Root
                className="inline-flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#FEFCF9] shadow-lg"
                style={{ border: "4px solid #B8860B" }}
              >
                <Avatar.Image
                  src={player.avatar_url ?? undefined}
                  alt={player.display_name}
                  className="h-full w-full object-cover"
                />
                <Avatar.Fallback className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#3D5A3E]">
                  {initials}
                </Avatar.Fallback>
              </Avatar.Root>
            </div>

            {/* Name in Playfair Display */}
            <h1
              className="flex items-center justify-center gap-2 text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              {player.display_name}
              {player.insurance_status === "active" ? (
                <ShieldCheck className="h-5 w-5 text-green-600" />
              ) : (
                <Shield className="h-5 w-5 text-[#0A2E12]/20" />
              )}
            </h1>

            {/* Club badge */}
            <ProfileClubBadge
              clubId={player.home_club_id ?? null}
              isOwnProfile={isOwnProfile}
            />

            {/* Member since */}
            <p className="mt-1 text-xs" style={{ color: "#3D5A3E" }}>
              Member since {memberSinceYear}
            </p>

            {/* Skill badge */}
            <div className="mt-3">
              <SkillBadge level={player.skill_level} />
            </div>

            {/* Position badges */}
            {(player.preferred_position || player.preferred_hand || player.years_experience !== null) && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
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
                {player.years_experience !== null && (
                  <span className="inline-flex items-center rounded-full bg-[#1B5E20] px-3 py-1 text-xs font-medium text-white">
                    {player.years_experience} {player.years_experience === 1 ? "year" : "years"} exp
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

            {/* Add Friend and Message buttons */}
            {currentPlayer && !isOwnProfile && (
              <div className="mt-6 flex items-center gap-3">
                <AddFriendButton
                  targetId={player.id}
                  status={friendStatus}
                />
                <Link
                  href={`/chat?to=${player.id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#145218] min-h-[44px]"
                >
                  <MessageCircle className="h-4 w-4" /> Message
                </Link>
                <FavoriteButton
                  playerId={currentPlayer.id}
                  favoriteId={player.id}
                  isFavorited={favorited}
                />
              </div>
            )}
          </div>

          {/* Bio */}
          {player.bio && (
            <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 shadow-sm">
              <h2
                className="mb-2 text-lg font-bold"
                style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
              >
                About
              </h2>
              <p className="text-sm whitespace-pre-line" style={{ color: "#3D5A3E" }}>{player.bio}</p>
            </div>
          )}

          {/* Skill Endorsements */}
          <Endorsements
            playerId={player.id}
            isOwnProfile={isOwnProfile}
            currentPlayerId={currentPlayer?.id ?? null}
          />

          {/* Honours & Badges (Achievements) */}
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 shadow-sm">
            <h2
              className="mb-3 text-lg font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              Honours & Badges
            </h2>
            <AchievementBadges achievements={achievements} />
          </div>

          {player.sports.length > 0 && (
            <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 shadow-sm">
              <h2
                className="mb-2 text-lg font-bold"
                style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
              >
                Sports
              </h2>
              <SportsTags sports={player.sports} />
            </div>
          )}

          <ProfileStatsSection stats={stats} favoritePartners={favoritePartners} />

          {player.sports.includes("lawn_bowling") && (
            <BowlsRatingsCard playerId={player.id} />
          )}

          <PhotoGalleryReadonly photos={photos} />

          <MatchHistory playerId={player.id} />

          <AvailabilitySchedule playerId={player.id} />

          <ClubAffiliations playerId={player.id} />

          <ContactInfo prefs={contactPrefs} />

          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 shadow-sm">
            <h2
              className="mb-2 text-lg font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              Waiver Status
            </h2>
            <WaiverStatus waiver={waiver} />
          </div>

          <p className="text-center text-xs" style={{ color: "#3D5A3E" }}>
            Member since {new Date(player.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
          </p>
        </div>
      </div>
    </div>
  );
}
