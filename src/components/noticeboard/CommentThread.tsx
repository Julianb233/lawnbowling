"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NoticeboardComment } from "@/lib/types";
import {
  Send,
  Loader2,
  Trash2,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";

interface CommentThreadProps {
  postId: string;
  currentPlayerId: string | null;
  isAdmin: boolean;
  onCommentAdded: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function CommentThread({
  postId,
  currentPlayerId,
  isAdmin,
  onCommentAdded,
}: CommentThreadProps) {
  const [comments, setComments] = useState<NoticeboardComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const LIMIT = 10;

  const fetchComments = useCallback(
    async (currentOffset: number, append = false) => {
      try {
        const res = await fetch(
          `/api/noticeboard/posts/${postId}/comments?limit=${LIMIT}&offset=${currentOffset}`
        );
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();

        setComments((prev) =>
          append ? [...data.comments, ...prev] : data.comments
        );
        setHasMore(data.hasMore);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    },
    [postId]
  );

  useEffect(() => {
    setLoading(true);
    fetchComments(0).finally(() => setLoading(false));
  }, [fetchComments]);

  const handleLoadMore = async () => {
    const nextOffset = offset + LIMIT;
    setLoadingMore(true);
    await fetchComments(nextOffset, true);
    setOffset(nextOffset);
    setLoadingMore(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/noticeboard/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to create comment");

      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
      onCommentAdded();

      // Scroll to bottom after adding comment
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    } catch (err) {
      console.error("Error creating comment:", err);
    } finally {
      setSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/noticeboard/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const charCount = newComment.length;
  const charLimitWarning = charCount > 450;
  const charLimitExceeded = charCount > 500;

  return (
    <div className="flex flex-col">
      {/* Comments list */}
      <div
        ref={scrollRef}
        className="max-h-80 overflow-y-auto overscroll-contain"
      >
        {/* Load more */}
        {hasMore && (
          <div className="px-4 py-2">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors disabled:opacity-50"
            >
              {loadingMore ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              Load earlier comments
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          </div>
        )}

        {/* Empty state */}
        {!loading && comments.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              No comments yet. Be the first!
            </p>
          </div>
        )}

        {/* Comment items */}
        <AnimatePresence initial={false}>
          {comments.map((comment) => {
            const author = comment.author;
            const canDelete =
              comment.author_id === currentPlayerId || isAdmin;

            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="group flex items-start gap-2.5 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                {/* Avatar */}
                <div className="shrink-0 mt-0.5">
                  {author?.avatar_url ? (
                    <img
                      src={author.avatar_url}
                      alt={author.display_name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700 flex items-center justify-center">
                      <UserIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {author?.display_name ?? "Unknown"}
                    </span>
                    <time
                      className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0"
                      title={new Date(comment.created_at).toLocaleString()}
                    >
                      {timeAgo(comment.created_at)}
                    </time>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed break-words">
                    {comment.body}
                  </p>
                </div>

                {/* Delete button */}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    className={cn(
                      "shrink-0 p-1 rounded-md text-zinc-300 dark:text-zinc-600",
                      "opacity-0 group-hover:opacity-100 focus:opacity-100",
                      "hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
                      "transition-all duration-150",
                      "disabled:opacity-50"
                    )}
                    aria-label="Delete comment"
                  >
                    {deletingId === comment.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Comment input */}
      {currentPlayerId && (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              maxLength={500}
              className={cn(
                "w-full rounded-full px-4 py-2 text-sm",
                "bg-white dark:bg-zinc-800",
                "border border-zinc-200 dark:border-zinc-700",
                "text-zinc-900 dark:text-zinc-100",
                "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400",
                "transition-all duration-150"
              )}
              aria-label="Write a comment"
              disabled={submitting}
            />
            {charLimitWarning && (
              <span
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums",
                  charLimitExceeded
                    ? "text-red-500"
                    : "text-amber-500"
                )}
              >
                {500 - charCount}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={
              !newComment.trim() || submitting || charLimitExceeded
            }
            className={cn(
              "shrink-0 p-2 rounded-full transition-all duration-150",
              "bg-emerald-600 text-white",
              "hover:bg-emerald-700 active:scale-95",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            )}
            aria-label="Send comment"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      )}
    </div>
  );
}
