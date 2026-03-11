"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NoticeboardPost, NoticeboardEmoji } from "@/lib/types";
import NoticeboardPostCard from "./NoticeboardPostCard";
import CreatePostSheet from "./CreatePostSheet";
import {
  Loader2,
  Newspaper,
  RefreshCw,
} from "lucide-react";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800" />
          </div>
          <div className="h-3 w-14 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="mt-4 flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Feed component ──────────────────────────────────────────────────────────

interface NoticeboardFeedProps {
  initialPosts: NoticeboardPost[];
  currentPlayerId: string | null;
  isAdmin: boolean;
  venueId: string;
}

export default function NoticeboardFeed({
  initialPosts,
  currentPlayerId,
  isAdmin,
  venueId,
}: NoticeboardFeedProps) {
  const [posts, setPosts] = useState<NoticeboardPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length === 20);
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  // ─── Fetch more posts (infinite scroll) ──────────────────────────────
  const fetchMore = useCallback(async () => {
    if (fetchingRef.current || !hasMore) return;
    fetchingRef.current = true;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/noticeboard/posts?limit=20&offset=${posts.length}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [posts.length, hasMore]);

  // ─── Intersection observer for infinite scroll ───────────────────────
  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchMore, hasMore, loading]);

  // ─── Refresh feed ────────────────────────────────────────────────────
  const refreshFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/noticeboard/posts?limit=20&offset=0");
      if (!res.ok) throw new Error("Failed to refresh");
      const data = await res.json();
      setPosts(data.posts);
      setHasMore(data.hasMore);
      setNewPostsAvailable(false);
    } catch (err) {
      console.error("Error refreshing feed:", err);
    }
  }, []);

  // ─── Supabase Realtime subscription ──────────────────────────────────
  useEffect(() => {
    if (!venueId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`noticeboard:${venueId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "noticeboard_posts",
          filter: `venue_id=eq.${venueId}`,
        },
        () => {
          setNewPostsAvailable(true);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "noticeboard_posts",
          filter: `venue_id=eq.${venueId}`,
        },
        () => {
          // Refresh on pin/delete updates
          refreshFeed();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "noticeboard_reactions",
        },
        () => {
          // We handle reactions optimistically, but sync on realtime for other users
          refreshFeed();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId, refreshFeed]);

  // ─── Reaction handler ────────────────────────────────────────────────
  const handleReaction = useCallback(
    async (postId: string, emoji: NoticeboardEmoji) => {
      try {
        await fetch(`/api/noticeboard/posts/${postId}/reactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji }),
        });
      } catch (err) {
        console.error("Reaction error:", err);
        // Refresh to revert optimistic update on error
        refreshFeed();
      }
    },
    [refreshFeed]
  );

  // ─── Pin handler ─────────────────────────────────────────────────────
  const handlePin = useCallback(
    async (postId: string, pin: boolean) => {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, is_pinned: pin } : p))
      );

      try {
        const res = await fetch(`/api/noticeboard/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_pinned: pin }),
        });
        if (!res.ok) throw new Error("Failed to update pin");
      } catch (err) {
        console.error("Pin error:", err);
        refreshFeed();
      }
    },
    [refreshFeed]
  );

  // ─── Delete handler ──────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (postId: string) => {
      // Optimistic remove
      setPosts((prev) => prev.filter((p) => p.id !== postId));

      try {
        const res = await fetch(`/api/noticeboard/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_deleted: true }),
        });
        if (!res.ok) throw new Error("Failed to delete");
      } catch (err) {
        console.error("Delete error:", err);
        refreshFeed();
      }
    },
    [refreshFeed]
  );

  // ─── Post created handler ────────────────────────────────────────────
  const handlePostCreated = useCallback(() => {
    refreshFeed();
  }, [refreshFeed]);

  // ─── Render ──────────────────────────────────────────────────────────

  const pinnedPosts = posts.filter((p) => p.is_pinned);
  const regularPosts = posts.filter((p) => !p.is_pinned);

  return (
    <div className="space-y-4">
      {/* Create post / announcement */}
      <CreatePostSheet
        isAdmin={isAdmin}
        onPostCreated={handlePostCreated}
      />

      {/* New posts banner */}
      <AnimatePresence>
        {newPostsAvailable && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={refreshFeed}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl",
              "bg-emerald-50 dark:bg-emerald-950/40",
              "border border-emerald-200 dark:border-emerald-800",
              "text-sm font-medium text-emerald-700 dark:text-emerald-300",
              "hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
              "transition-colors"
            )}
          >
            <RefreshCw className="w-4 h-4" />
            New posts available -- tap to refresh
          </motion.button>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {posts.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 px-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 flex items-center justify-center mb-4">
            <Newspaper className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Nothing here yet
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-xs">
            Be the first to post! Share updates, celebrate wins, or start a
            conversation with your club.
          </p>
        </motion.div>
      )}

      {/* Pinned posts section */}
      {pinnedPosts.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {pinnedPosts.map((post) => (
              <NoticeboardPostCard
                key={post.id}
                post={post}
                currentPlayerId={currentPlayerId}
                isAdmin={isAdmin}
                onReaction={handleReaction}
                onPin={handlePin}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Regular posts */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {regularPosts.map((post) => (
            <NoticeboardPostCard
              key={post.id}
              post={post}
              currentPlayerId={currentPlayerId}
              isAdmin={isAdmin}
              onReaction={handleReaction}
              onPin={handlePin}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Loading indicator for infinite scroll */}
      {loading && (
        <div className="space-y-3">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={observerRef} className="h-1" aria-hidden="true" />

      {/* End of feed */}
      {!hasMore && posts.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            You&apos;ve reached the end of the feed
          </p>
        </div>
      )}
    </div>
  );
}
