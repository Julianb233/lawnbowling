"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type {
  NoticeboardPost,
  NoticeboardEmoji,
  Player,
} from "@/lib/types";
import { NOTICEBOARD_EMOJIS } from "@/lib/types";
import {
  Pin,
  Megaphone,
  Trophy,
  MessageCircle,
  MoreVertical,
  Trash2,
  PinOff,
  ChevronDown,
  ChevronUp,
  User as UserIcon,
} from "lucide-react";
import CommentThread from "./CommentThread";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Render markdown-lite: **bold**, *italics*, line breaks */
function renderMarkdownLite(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) result.push(<br key={`br-${lineIdx}`} />);

    // Process bold and italic
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    parts.forEach((part, partIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        result.push(
          <strong key={`${lineIdx}-${partIdx}`} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith("*") && part.endsWith("*")) {
        result.push(
          <em key={`${lineIdx}-${partIdx}`}>{part.slice(1, -1)}</em>
        );
      } else {
        result.push(part);
      }
    });
  });

  return result;
}

const POST_TYPE_CONFIG = {
  announcement: {
    icon: Megaphone,
    label: "Announcement",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  tournament_result: {
    icon: Trophy,
    label: "Tournament Result",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  member_post: {
    icon: MessageCircle,
    label: "Post",
    badgeColor: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  },
};

const EMOJI_LABELS: Record<NoticeboardEmoji, string> = {
  "👍": "thumbs up",
  "👏": "clap",
  "🔥": "fire",
  "🎉": "celebrate",
  "❤️": "love",
};

// ─── Component ───────────────────────────────────────────────────────────────

interface NoticeboardPostCardProps {
  post: NoticeboardPost;
  currentPlayerId: string | null;
  isAdmin: boolean;
  onReaction: (postId: string, emoji: NoticeboardEmoji) => void;
  onPin: (postId: string, pin: boolean) => void;
  onDelete: (postId: string) => void;
}

export default function NoticeboardPostCard({
  post,
  currentPlayerId,
  isAdmin,
  onReaction,
  onPin,
  onDelete,
}: NoticeboardPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [localReactionCounts, setLocalReactionCounts] = useState(
    post.reaction_counts ?? ({} as Record<NoticeboardEmoji, number>)
  );
  const [localMyReactions, setLocalMyReactions] = useState<Set<NoticeboardEmoji>>(() => {
    const set = new Set<NoticeboardEmoji>();
    if (post.reactions && currentPlayerId) {
      for (const r of post.reactions) {
        if (r.player_id === currentPlayerId) set.add(r.emoji);
      }
    }
    return set;
  });
  const [localCommentCount, setLocalCommentCount] = useState(
    post.comment_count ?? 0
  );

  const postType = post.type ?? "member_post";
  const typeConfig = POST_TYPE_CONFIG[postType as keyof typeof POST_TYPE_CONFIG] ?? POST_TYPE_CONFIG.member_post;
  const TypeIcon = typeConfig.icon;
  const author = post.author as Player | undefined;

  const handleReaction = useCallback(
    (emoji: NoticeboardEmoji) => {
      // Optimistic update
      setLocalReactionCounts((prev) => {
        const updated = { ...prev };
        if (localMyReactions.has(emoji)) {
          updated[emoji] = Math.max((updated[emoji] ?? 0) - 1, 0);
        } else {
          updated[emoji] = (updated[emoji] ?? 0) + 1;
        }
        return updated;
      });
      setLocalMyReactions((prev) => {
        const updated = new Set(prev);
        if (updated.has(emoji)) {
          updated.delete(emoji);
        } else {
          updated.add(emoji);
        }
        return updated;
      });
      onReaction(post.id, emoji);
    },
    [post.id, localMyReactions, onReaction]
  );

  const handleCommentAdded = useCallback(() => {
    setLocalCommentCount((c) => c + 1);
  }, []);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative rounded-2xl overflow-hidden transition-shadow",
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "shadow-sm hover:shadow-md",
        post.is_pinned && "ring-2 ring-amber-400/50 dark:ring-amber-500/30"
      )}
      role="article"
      aria-label={`${typeConfig.label} by ${author?.display_name ?? "Unknown"}`}
    >
      {/* Pinned indicator bar */}
      {post.is_pinned && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-800/30">
          <Pin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Pinned
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        {/* Avatar */}
        <div className="shrink-0">
          {author?.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.display_name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center ring-2 ring-zinc-100 dark:ring-zinc-800">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Author + Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {author?.display_name ?? "Unknown Player"}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide",
                typeConfig.badgeColor
              )}
            >
              <TypeIcon className="w-3 h-3" />
              {typeConfig.label}
            </span>
          </div>
          <time
            className="text-xs text-zinc-500 dark:text-zinc-400"
            dateTime={post.created_at}
            title={new Date(post.created_at).toLocaleString()}
          >
            {timeAgo(post.created_at)}
          </time>
        </div>

        {/* Admin menu */}
        {isAdmin && (
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
              aria-label="Post options"
              aria-expanded={showMenu}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl py-1"
                >
                  <button
                    onClick={() => {
                      onPin(post.id, !post.is_pinned);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {post.is_pinned ? (
                      <PinOff className="w-4 h-4" />
                    ) : (
                      <Pin className="w-4 h-4" />
                    )}
                    {post.is_pinned ? "Unpin" : "Pin to top"}
                  </button>
                  <button
                    onClick={() => {
                      onDelete(post.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete post
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Title */}
      {post.title && (
        <h3 className="px-4 pb-1 text-base font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
          {post.title}
        </h3>
      )}

      {/* Body */}
      <div className="px-4 pb-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
        {renderMarkdownLite(post.body)}
      </div>

      {/* Reaction bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-1 flex-wrap" role="group" aria-label="Reactions">
          {NOTICEBOARD_EMOJIS.map((emoji) => {
            const count = localReactionCounts[emoji] ?? 0;
            const isActive = localMyReactions.has(emoji);

            return (
              <motion.button
                key={emoji}
                whileTap={{ scale: 1.3 }}
                onClick={() => handleReaction(emoji)}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-all duration-150",
                  "border",
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300"
                    : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/50"
                )}
                aria-label={`React with ${EMOJI_LABELS[emoji]}${count > 0 ? `, ${count} reactions` : ""}`}
                aria-pressed={isActive}
              >
                <motion.span
                  key={`${emoji}-${isActive}`}
                  initial={isActive ? { scale: 1.4, rotate: -10 } : { scale: 1 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="text-base leading-none"
                >
                  {emoji}
                </motion.span>
                {count > 0 && (
                  <motion.span
                    key={`count-${emoji}-${count}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xs font-medium tabular-nums"
                  >
                    {count}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Comment toggle */}
      <button
        onClick={() => setShowComments(!showComments)}
        className={cn(
          "flex items-center gap-2 w-full px-4 py-2.5",
          "border-t border-zinc-100 dark:border-zinc-800",
          "text-sm text-zinc-600 dark:text-zinc-400",
          "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        )}
        aria-expanded={showComments}
        aria-label={`${localCommentCount} comments. ${showComments ? "Collapse" : "Expand"} comments`}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="font-medium">
          {localCommentCount === 0
            ? "Add a comment..."
            : `${localCommentCount} comment${localCommentCount !== 1 ? "s" : ""}`}
        </span>
        <span className="ml-auto">
          {showComments ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* Comment thread (expandable) */}
      <AnimatePresence initial={false}>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-100 dark:border-zinc-800">
              <CommentThread
                postId={post.id}
                currentPlayerId={currentPlayerId}
                isAdmin={isAdmin}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-outside handler for menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
          aria-hidden="true"
        />
      )}
    </motion.article>
  );
}
