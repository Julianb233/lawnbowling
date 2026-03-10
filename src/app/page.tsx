export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Home, Users, User, Settings } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-emerald-400">Pick a Partner</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-400">Live</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome{player?.name ? `, ${player.name}` : ""}
            </h1>
            <p className="mt-1 text-zinc-400">
              Ready to find a partner?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm text-zinc-400">Status</p>
              <p className="mt-1 font-semibold">
                {player?.is_available ? (
                  <span className="text-emerald-400">Available</span>
                ) : (
                  <span className="text-zinc-500">Offline</span>
                )}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm text-zinc-400">Skill</p>
              <p className="mt-1 font-semibold capitalize">
                {player?.skill_level || "Beginner"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <p className="text-zinc-400">
              Check in to see available players and find a match.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-3 py-1 text-emerald-400"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            href="/queue"
            className="flex flex-col items-center gap-1 px-3 py-1 text-zinc-500 hover:text-zinc-300"
          >
            <Users className="h-5 w-5" />
            <span className="text-xs">Queue</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-1 px-3 py-1 text-zinc-500 hover:text-zinc-300"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Me</span>
          </Link>
          <Link
            href="/settings"
            className="flex flex-col items-center gap-1 px-3 py-1 text-zinc-500 hover:text-zinc-300"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
