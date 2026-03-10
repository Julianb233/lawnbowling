"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/board/BottomNav";
import { MatchHistoryDetail } from "@/components/stats/MatchHistoryDetail";

export default function MatchHistoryPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      setLoadingAuth(false);
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/stats"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Match History</h1>
              <p className="text-sm text-zinc-500">
                Your past games and results
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {loadingAuth ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl bg-zinc-100"
              />
            ))}
          </div>
        ) : currentUserId ? (
          <MatchHistoryDetail playerId={currentUserId} />
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-500">
              Please sign in to view your match history
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
