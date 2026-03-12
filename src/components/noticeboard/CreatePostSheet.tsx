"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  Megaphone,
  MessageSquarePlus,
  X,
  Pin,
  Send,
  Loader2,
} from "lucide-react";

interface CreatePostSheetProps {
  isAdmin: boolean;
  onPostCreated: () => void;
}

export default function CreatePostSheet({
  isAdmin,
  onPostCreated,
}: CreatePostSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"member_post" | "announcement">(
    "member_post"
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const reset = () => {
    setTitle("");
    setBody("");
    setIsPinned(false);
    setError(null);
    setMode("member_post");
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/noticeboard/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          title: mode === "announcement" ? title.trim() || undefined : undefined,
          content: body.trim(),
          is_pinned: mode === "announcement" ? isPinned : false,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }

      handleClose();
      onPostCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Create button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 w-full px-4 py-3 rounded-2xl",
          "bg-white",
          "border border-[#0A2E12]/10",
          "text-sm text-[#3D5A3E]",
          "hover:bg-[#0A2E12]/[0.03]:bg-[#0A2E12]/50",
          "hover:border-emerald-300:border-emerald-800",
          "transition-all duration-150",
          "shadow-sm"
        )}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
          <Plus className="w-4 h-4 text-white" />
        </div>
        <span>Share something with your club...</span>
      </button>

      {/* Sheet overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50",
                "bg-white",
                "rounded-t-3xl",
                "shadow-2xl",
                "max-h-[85vh] overflow-y-auto"
              )}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[#0A2E12]/10" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3">
                <h2 className="text-lg font-bold text-[#0A2E12]">
                  {mode === "announcement"
                    ? "New Announcement"
                    : "New Post"}
                </h2>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-[#3D5A3E] hover:text-[#3D5A3E]:text-[#3D5A3E] hover:bg-[#0A2E12]/5:bg-[#0A2E12] transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode tabs (admin only) */}
              {isAdmin && (
                <div className="flex gap-2 px-5 pb-3">
                  <button
                    onClick={() => setMode("member_post")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                      mode === "member_post"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-[#0A2E12]/5 text-[#3D5A3E]"
                    )}
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    Post
                  </button>
                  <button
                    onClick={() => setMode("announcement")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                      mode === "announcement"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-[#0A2E12]/5 text-[#3D5A3E]"
                    )}
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    Announcement
                  </button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">
                {/* Title (announcement only) */}
                {mode === "announcement" && (
                  <div>
                    <label
                      htmlFor="post-title"
                      className="block text-xs font-medium text-[#3D5A3E] mb-1.5 uppercase tracking-wide"
                    >
                      Title
                    </label>
                    <input
                      id="post-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Green Maintenance Schedule"
                      className={cn(
                        "w-full rounded-xl px-4 py-2.5 text-sm",
                        "bg-[#0A2E12]/[0.03]",
                        "border border-[#0A2E12]/10",
                        "text-[#0A2E12]",
                        "placeholder:text-[#3D5A3E]:text-[#3D5A3E]",
                        "focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400",
                        "transition-all duration-150"
                      )}
                    />
                  </div>
                )}

                {/* Body */}
                <div>
                  <label
                    htmlFor="post-body"
                    className="block text-xs font-medium text-[#3D5A3E] mb-1.5 uppercase tracking-wide"
                  >
                    {mode === "announcement" ? "Message" : "What's on your mind?"}
                  </label>
                  <textarea
                    id="post-body"
                    ref={bodyRef}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={
                      mode === "announcement"
                        ? "Write your announcement here..."
                        : "Share an update, celebrate a win, or start a conversation..."
                    }
                    rows={4}
                    className={cn(
                      "w-full rounded-xl px-4 py-3 text-sm resize-none",
                      "bg-[#0A2E12]/[0.03]",
                      "border border-[#0A2E12]/10",
                      "text-[#0A2E12]",
                      "placeholder:text-[#3D5A3E]:text-[#3D5A3E]",
                      "focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400",
                      "transition-all duration-150"
                    )}
                  />
                  <p className="mt-1 text-[10px] text-[#3D5A3E]">
                    Supports **bold** and *italic* formatting
                  </p>
                </div>

                {/* Pin toggle (announcement only) */}
                {mode === "announcement" && (
                  <button
                    type="button"
                    onClick={() => setIsPinned(!isPinned)}
                    className={cn(
                      "flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm transition-colors",
                      "border",
                      isPinned
                        ? "bg-amber-50 border-amber-300 text-amber-800"
                        : "bg-[#0A2E12]/[0.03] border-[#0A2E12]/10 text-[#3D5A3E]"
                    )}
                  >
                    <Pin
                      className={cn(
                        "w-4 h-4",
                        isPinned && "text-amber-600"
                      )}
                    />
                    <span className="font-medium">Pin this announcement</span>
                    <div
                      className={cn(
                        "ml-auto w-10 h-6 rounded-full transition-colors duration-200 relative",
                        isPinned
                          ? "bg-amber-500"
                          : "bg-[#0A2E12]/10"
                      )}
                    >
                      <motion.div
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                        animate={{ left: isPinned ? 18 : 2 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    </div>
                  </button>
                )}

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-500">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!body.trim() || submitting}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full py-3 rounded-xl",
                    "text-sm font-semibold text-white",
                    "transition-all duration-150",
                    mode === "announcement"
                      ? "bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
                      : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {submitting
                    ? "Posting..."
                    : mode === "announcement"
                      ? "Post Announcement"
                      : "Share Post"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
