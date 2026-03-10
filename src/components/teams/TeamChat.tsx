"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useTeamChat } from "@/lib/hooks/useTeamChat";
import { cn } from "@/lib/utils";

interface TeamChatProps {
  teamId: string;
  currentUserId: string | null;
}

export function TeamChat({ teamId, currentUserId }: TeamChatProps) {
  const { messages, loading, sendMessage } = useTeamChat(teamId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const text = input.trim();
    setInput("");
    try {
      await sendMessage(text);
    } catch {
      setInput(text);
    }
    setSending(false);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-[480px] flex-col rounded-xl border border-zinc-200 bg-white">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">
            No messages yet. Say hello!
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}
            >
              {!isMe && (
                <div className="mt-1 h-7 w-7 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                  {msg.sender?.avatar_url ? (
                    <img src={msg.sender.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500">
                      {msg.sender?.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
              )}
              <div className={cn("max-w-[75%]", isMe ? "items-end" : "items-start")}>
                {!isMe && (
                  <p className="mb-0.5 text-xs text-zinc-600">{msg.sender?.name}</p>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-sm",
                    isMe
                      ? "rounded-br-md bg-emerald-600 text-white"
                      : "rounded-bl-md bg-zinc-100 text-zinc-700"
                  )}
                >
                  {msg.content}
                </div>
                <p className={cn("mt-0.5 text-xs text-zinc-700", isMe && "text-right")}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-zinc-200 p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
