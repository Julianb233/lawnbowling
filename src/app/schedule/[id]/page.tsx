export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameById } from "@/lib/db/schedule";
import { GameDetail } from "@/components/schedule/GameDetail";
import Link from "next/link";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const game = await getGameById(id);

  return (
    <div className="min-h-screen bg-animated-gradient">
      <header className="sticky top-0 z-40 glass border-b border-zinc-200">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link
            href="/schedule"
            className="text-sm text-zinc-400 hover:text-zinc-700"
          >
            {"\u2190"} Back to Schedule
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        <GameDetail game={game} currentPlayerId={user.id} />
      </main>
    </div>
  );
}
