export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: favorites } = await supabase
    .from("favorites")
    .select("*, favorite:players!favorite_id(*)")
    .eq("player_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-animated-gradient">
      <header className="sticky top-0 z-40 glass border-b border-zinc-700/30">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-zinc-100">
            {"\u2B50"} Favorites
          </h1>
          <Link href="/board" className="text-sm text-zinc-400 hover:text-zinc-200">
            Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        {!favorites || favorites.length === 0 ? (
          <div className="rounded-2xl glass p-8 text-center">
            <p className="text-3xl mb-2">{"\u2B50"}</p>
            <p className="text-zinc-400 mb-4">
              No favorites yet. Star players you enjoy playing with!
            </p>
            <Link
              href="/board"
              className="inline-block rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              Find Players
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((fav: any) => {
              const player = fav.favorite;
              if (!player) return null;
              return (
                <Link
                  key={fav.id}
                  href={`/profile/${player.id}`}
                  className="flex items-center gap-3 rounded-xl glass p-3 hover:bg-white/5 transition-colors"
                >
                  <div className="relative">
                    {player.avatar_url ? (
                      <img
                        src={player.avatar_url}
                        alt={player.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-white">
                        {player.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    {player.is_available && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-zinc-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">
                      {player.name}
                    </p>
                    <p className="text-xs text-zinc-500 capitalize">
                      {player.skill_level} &middot;{" "}
                      {player.is_available ? "Online" : "Offline"}
                    </p>
                  </div>
                  <span className="text-amber-400">{"\u2B50"}</span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
