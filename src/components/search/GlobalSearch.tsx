"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchResults } from "./SearchResults";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ players: []; teams: []; games: [] }>({ players: [], teams: [], games: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cmd+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults({ players: [], teams: [], games: [] }); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  function handleSelect(type: string, id: string) {
    setOpen(false);
    setQuery("");
    if (type === "player") router.push(`/profile/${id}`);
    else if (type === "team") router.push(`/teams/${id}`);
    else if (type === "game") router.push(`/schedule`);
  }

  // Save recent searches
  function handleSearch() {
    if (query.trim().length < 2) return;
    const recent = JSON.parse(localStorage.getItem("recent_searches") || "[]");
    const updated = [query, ...recent.filter((r: string) => r !== query)].slice(0, 5);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 min-h-[44px] transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 sm:inline">
          &#8984;K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-[15vh]"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl glass overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3">
                <Search className="h-5 w-5 text-zinc-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search players, teams, games..."
                  className="flex-1 bg-transparent text-zinc-900 placeholder-zinc-600 outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")}>
                    <X className="h-4 w-4 text-zinc-500" />
                  </button>
                )}
              </div>

              {/* Results */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                </div>
              ) : query.length >= 2 ? (
                <SearchResults {...results} onSelect={handleSelect} />
              ) : (
                <div className="px-4 py-6 text-center text-sm text-zinc-600">
                  Type at least 2 characters to search
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
