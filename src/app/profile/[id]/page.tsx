export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getPlayerById } from "@/lib/db/players";
import { getWaiverByPlayerId } from "@/lib/db/waivers";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { WaiverStatus } from "@/components/waiver/WaiverStatus";
import { SportsTags } from "@/components/profile/SportsTags";
import { SkillBadge } from "@/components/profile/SkillBadge";
import * as Avatar from "@radix-ui/react-avatar";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Shield } from "lucide-react";

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let player;
  try {
    player = await getPlayerById(id);
  } catch {
    notFound();
  }

  const waiver = await getWaiverByPlayerId(player.id);

  const initials = player.display_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Board
        </Link>

        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <Avatar.Root className="mb-4 inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/10">
              <Avatar.Image
                src={player.avatar_url ?? undefined}
                alt={player.display_name}
                className="h-full w-full object-cover"
              />
              <Avatar.Fallback className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/60">
                {initials}
              </Avatar.Fallback>
            </Avatar.Root>

            <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
              {player.display_name}
              {player.insurance_status === "active" ? (
                <ShieldCheck className="h-5 w-5 text-green-400" />
              ) : (
                <Shield className="h-5 w-5 text-white/30" />
              )}
            </h1>

            <div className="mt-2">
              <SkillBadge level={player.skill_level} />
            </div>
          </div>

          {player.sports.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-white/60">Sports</h2>
              <SportsTags sports={player.sports} />
            </div>
          )}

          <div>
            <h2 className="mb-2 text-sm font-medium text-white/60">Waiver Status</h2>
            <WaiverStatus waiver={waiver} />
          </div>

          <p className="text-center text-xs text-white/30">
            Member since {new Date(player.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
          </p>
        </div>
      </div>
    </div>
  );
}
