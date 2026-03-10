import { listMatches } from "@/lib/db/matches";

export default async function MatchesAdminPage() {
  const { matches, total } = await listMatches({ limit: 50 });

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">
        Match History ({total})
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-zinc-500">
              <th className="pb-2 font-medium">Sport</th>
              <th className="pb-2 font-medium">Players</th>
              <th className="pb-2 font-medium">Court</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Duration</th>
              <th className="pb-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {matches.map((match) => {
              const duration =
                match.started_at && match.ended_at
                  ? Math.round(
                      (new Date(match.ended_at).getTime() -
                        new Date(match.started_at).getTime()) /
                        60000
                    )
                  : null;

              return (
                <tr key={match.id}>
                  <td className="py-3 text-zinc-100 capitalize">
                    {match.sport.replace("_", " ")}
                  </td>
                  <td className="py-3 text-zinc-400">
                    {(match as { match_players?: { players?: { display_name: string } }[] }).match_players
                      ?.map((mp) => mp.players?.display_name)
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </td>
                  <td className="py-3 text-zinc-400">
                    {(match as { courts?: { name: string } | null }).courts?.name ?? "-"}
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        match.status === "completed"
                          ? "bg-zinc-700/50 text-zinc-400"
                          : match.status === "playing"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {match.status}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-500">
                    {duration !== null ? `${duration} min` : "-"}
                  </td>
                  <td className="py-3 text-zinc-500">
                    {new Date(match.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {matches.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500 italic">
            No matches yet.
          </p>
        )}
      </div>
    </div>
  );
}
