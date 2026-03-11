"use client";

import { useState, useEffect } from "react";
import { Search, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface WaiverRecord {
  id: string;
  player_id: string;
  accepted: boolean;
  ip_address: string;
  user_agent: string;
  accepted_at: string;
  players: {
    display_name: string;
    avatar_url: string | null;
  };
}

const PAGE_SIZE = 50;

export function AdminWaiversClient() {
  const [waivers, setWaivers] = useState<WaiverRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchWaivers(0);
  }, []);

  async function fetchWaivers(offset: number) {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await fetch(`/api/admin/waivers?limit=${PAGE_SIZE}&offset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        if (offset === 0) {
          setWaivers(data.waivers);
        } else {
          setWaivers((prev) => [...prev, ...data.waivers]);
        }
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const filtered = search
    ? waivers.filter((w) =>
        w.players?.display_name?.toLowerCase().includes(search.toLowerCase())
      )
    : waivers;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-900/60 hover:text-zinc-900 min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Signed Waivers</h1>
            <p className="text-sm text-zinc-900/60">{total} total waivers</p>
          </div>
          <FileText className="h-8 w-8 text-zinc-900/20" />
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-900/40" />
          <input
            type="text"
            placeholder="Search by player name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-zinc-900 placeholder:text-zinc-900/40 focus:border-[#1B5E20] focus:outline-none min-h-[44px]"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 py-12 text-center">
            <p className="text-zinc-900/40">No waivers found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-zinc-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:bg-white/5">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-900/60">
                      Player
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-900/60">
                      Signed Date
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-900/60 md:table-cell">
                      IP Address
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-900/60 lg:table-cell">
                      User Agent
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((waiver) => (
                    <tr key={waiver.id} className="hover:bg-zinc-50 dark:bg-white/5">
                      <td className="px-4 py-3">
                        <Link
                          href={`/profile/${waiver.player_id}`}
                          className="font-medium text-[#1B5E20] hover:underline"
                        >
                          {waiver.players?.display_name ?? "Unknown"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-900/70">
                        {new Date(waiver.accepted_at).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-zinc-900/50 md:table-cell">
                        {waiver.ip_address}
                      </td>
                      <td className="hidden max-w-xs truncate px-4 py-3 text-sm text-zinc-900/50 lg:table-cell">
                        {waiver.user_agent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-zinc-900/50">
                Showing {filtered.length} of {total} waivers
              </p>
              {waivers.length < total && (
                <button
                  onClick={() => fetchWaivers(waivers.length)}
                  disabled={loadingMore}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-900/70 transition-colors hover:bg-zinc-50 disabled:opacity-50 min-h-[44px]"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
