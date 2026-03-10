export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActivityFeed } from "@/lib/db/activity";
import { ActivityFeed } from "@/components/social/ActivityFeed";
import { BottomNav } from "@/components/board/BottomNav";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const items = await getActivityFeed(undefined, 50);

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
            <Link
              href="/board"
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-zinc-900">Activity</h1>
          </div>
          <p className="text-sm text-zinc-500 ml-10">
            Recent happenings at the venue
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <ActivityFeed items={items} />
      </div>

      <BottomNav />
    </div>
  );
}
