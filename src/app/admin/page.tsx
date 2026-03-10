import { createClient } from "@/lib/supabase/server";

async function getStats() {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [playersRes, matchesTodayRes, courtsRes, activePlayersRes] =
    await Promise.all([
      supabase
        .from("players")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today.toISOString()),
      supabase
        .from("courts")
        .select("id, is_available", { count: "exact" }),
      supabase
        .from("players")
        .select("id", { count: "exact", head: true })
        .eq("is_available", true),
    ]);

  const courtsInUse =
    courtsRes.data?.filter((c) => !c.is_available).length ?? 0;

  return {
    totalPlayers: playersRes.count ?? 0,
    matchesToday: matchesTodayRes.count ?? 0,
    totalCourts: courtsRes.count ?? 0,
    courtsInUse,
    playersOnline: activePlayersRes.count ?? 0,
  };
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-zinc-100">{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Players Online" value={stats.playersOnline} />
        <StatCard label="Matches Today" value={stats.matchesToday} />
        <StatCard
          label="Courts In Use"
          value={`${stats.courtsInUse} / ${stats.totalCourts}`}
        />
        <StatCard label="Total Players" value={stats.totalPlayers} />
      </div>
    </div>
  );
}
