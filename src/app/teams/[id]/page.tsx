"use client";

import { useState, useEffect, use } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeft, Users, MessageCircle, BarChart3 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/board/BottomNav";
import { TeamRoster } from "@/components/teams/TeamRoster";
import { TeamChat } from "@/components/teams/TeamChat";
import { InviteLink } from "@/components/teams/InviteLink";
import { SPORT_LABELS } from "@/lib/types";
import { getSportColor } from "@/lib/design";
import type { Team } from "@/lib/types";

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [team, setTeam] = useState<(Team & { captain?: { id: string; name: string; avatar_url: string | null } }) | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      try {
        const res = await fetch(`/api/teams/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTeam(data.team);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-zinc-500">Team not found</p>
      </div>
    );
  }

  const sportLabel = SPORT_LABELS[team.sport as keyof typeof SPORT_LABELS];
  const sportColor = getSportColor(team.sport);

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/teams" className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-zinc-900">{team.name}</h1>
              <p className="text-sm text-zinc-500">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${sportColor.primary}15`,
                    color: sportColor.primary,
                  }}
                >
                  {sportLabel?.emoji} {sportLabel?.label ?? team.sport}
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-4">
        {team.description && (
          <p className="mb-4 text-sm text-zinc-400">{team.description}</p>
        )}

        <div className="mb-4">
          <InviteLink inviteCode={team.invite_code} />
        </div>

        <Tabs.Root defaultValue="members">
          <Tabs.List className="mb-4 flex gap-1 rounded-xl bg-white p-1">
            <Tabs.Trigger
              value="members"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-zinc-500 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900"
            >
              <Users className="h-4 w-4" /> Members
            </Tabs.Trigger>
            <Tabs.Trigger
              value="chat"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-zinc-500 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900"
            >
              <MessageCircle className="h-4 w-4" /> Chat
            </Tabs.Trigger>
            <Tabs.Trigger
              value="stats"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-zinc-500 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900"
            >
              <BarChart3 className="h-4 w-4" /> Stats
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="members">
            <TeamRoster
              teamId={team.id}
              currentUserId={currentUserId}
              captainId={team.captain_id}
            />
          </Tabs.Content>

          <Tabs.Content value="chat">
            <TeamChat teamId={team.id} currentUserId={currentUserId} />
          </Tabs.Content>

          <Tabs.Content value="stats">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 text-zinc-700" />
              <p className="text-sm text-zinc-500">Team stats coming soon</p>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <BottomNav />
    </div>
  );
}
