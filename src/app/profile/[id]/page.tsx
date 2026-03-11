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
import { PhotoGalleryReadonly } from "@/components/profile/PhotoGallery";
import { getPlayerPhotos } from "@/lib/db/gallery";
import { getContactPreferences } from "@/lib/db/contact-preferences";
import { ContactInfo } from "@/components/profile/ContactPreferences";
import { getPlayerAchievements } from "@/lib/db/achievements";
import { AchievementBadges } from "@/components/profile/AchievementBadges";
import { Endorsements } from "@/components/profile/Endorsements";
import * as Avatar from "@radix-ui/react-avatar";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Shield } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-[#FEFCF9] px-4 py-8">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Board
        </Link>

        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <Avatar.Root className="mb-4 inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
              <Avatar.Image
                src={player.avatar_url ?? undefined}
                alt={player.display_name}
                className="h-full w-full object-cover"
              />
              <Avatar.Fallback className="flex h-full w-full items-center justify-center text-2xl font-bold text-zinc-500">
                {initials}
              </Avatar.Fallback>
            </Avatar.Root>

            <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900">
              {player.display_name}
              {player.insurance_status === "active" ? (
                <ShieldCheck className="h-5 w-5 text-green-600" />
              ) : (
                <Shield className="h-5 w-5 text-zinc-300" />
              )}
            </h1>

            <div className="mt-2">
              <SkillBadge level={player.skill_level} />
            </div>

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
              <h2 className="mb-2 text-sm font-medium text-zinc-600">About</h2>
              <p className="text-sm text-zinc-700 whitespace-pre-line">{player.bio}</p>
            </div>
          )}

          {(player.preferred_position || player.preferred_hand || player.years_experience !== null) && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-zinc-600">Preferences</h2>
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
              <h2 className="mb-2 text-sm font-medium text-zinc-600">Sports</h2>
              <SportsTags sports={player.sports} />
            </div>
          )}

          <ProfileStatsSection stats={stats} favoritePartners={favoritePartners} />

          <AchievementBadges achievements={achievements} />

          <Endorsements
            playerId={player.id}
            isOwnProfile={isOwnProfile}
            currentPlayerId={currentPlayer?.id ?? null}
          />

          <PhotoGalleryReadonly photos={photos} />

          <MatchHistory playerId={player.id} />

          <AvailabilitySchedule playerId={player.id} />

          <ContactInfo prefs={contactPrefs} />

          <div>
            <h2 className="mb-2 text-sm font-medium text-zinc-600">Waiver Status</h2>
            <WaiverStatus waiver={waiver} />
          </div>

          <p className="text-center text-xs text-zinc-500">
            Member since {new Date(player.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
          </p>
        </div>
      </div>
    </div>
  );
}
