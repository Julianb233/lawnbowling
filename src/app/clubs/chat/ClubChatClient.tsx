"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import * as Avatar from "@radix-ui/react-avatar";
import { ArrowLeft, Send, Users, Pin, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/board/BottomNav";
import { createClient } from "@/lib/supabase/client";
import type { PlayerProfile } from "@/lib/db/players";
import type { ClubMessage } from "@/lib/db/club-messages";

interface ClubInfo {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Member {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

interface ClubChatClientProps {
  currentPlayer: PlayerProfile;
  club: ClubInfo;
  members: Member[];
  initialMessages: ClubMessage[];
  isAdmin: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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

export function ClubChatClient({
  currentPlayer,
  club,
  members,
  initialMessages,
  isAdmin,
}: ClubChatClientProps) {
  const [messages, setMessages] = useState<ClubMessage[]>(initialMessages);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Subscribe to realtime club messages
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`club-chat-${club.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "club_messages",
          filter: `club_id=eq.${club.id}`,
        },
        (payload) => {
          const newMsg = payload.new as ClubMessage;
          // Don't duplicate our own optimistic messages
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // Attach sender info from members list
            const sender = members.find((m) => m.id === newMsg.sender_id);
            return [
              ...prev,
              {
                ...newMsg,
                sender: sender ?? {
                  id: newMsg.sender_id,
                  display_name: "Unknown",
                  avatar_url: null,
                },
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [club.id, members]);

  async function handleSend() {
    if (!messageInput.trim() || sending) return;

    const content = messageInput.trim();
    setMessageInput("");
    setSending(true);

    // Optimistic update
    const optimisticMsg: ClubMessage = {
      id: crypto.randomUUID(),
      club_id: club.id,
      sender_id: currentPlayer.id,
      content,
      is_pinned: false,
      created_at: new Date().toISOString(),
      sender: {
        id: currentPlayer.id,
        display_name: currentPlayer.display_name,
        avatar_url: currentPlayer.avatar_url ?? null,
      },
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/clubs/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId: club.id, content }),
      });
      if (res.ok) {
        const savedMsg = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? savedMsg : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.filter((m) => m.id !== optimisticMsg.id)
      );
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  }

  const pinnedMessages = messages.filter((m) => m.is_pinned);

  return (
    <div className="flex min-h-screen flex-col bg-[#FEFCF9]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/clubs/dashboard"
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-[#3D5A3E] hover:bg-[#F0FFF4] transition-colors min-h-[44px]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-[#0A2E12] truncate">
              {club.name}
            </h1>
            <p className="text-xs text-[#3D5A3E]">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-[#3D5A3E] hover:bg-[#F0FFF4] transition-colors min-h-[44px]"
          >
            <Users className="h-5 w-5" />
          </button>
        </div>

        {/* Members drawer */}
        {showMembers && (
          <div className="border-t border-[#0A2E12]/5 bg-white px-4 py-3">
            <div className="mx-auto max-w-3xl">
              <h3 className="mb-2 text-xs font-semibold text-[#3D5A3E] uppercase tracking-wider">
                Members
              </h3>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <Link
                    key={member.id}
                    href={`/profile/${member.id}`}
                    className="flex items-center gap-1.5 rounded-full bg-[#F0FFF4] px-3 py-1.5 text-xs text-[#0A2E12] hover:bg-[#1B5E20]/10 transition-colors"
                  >
                    <Avatar.Root className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[#1B5E20]/10">
                      <Avatar.Image
                        src={member.avatar_url ?? undefined}
                        alt={member.display_name}
                        className="h-full w-full object-cover"
                      />
                      <Avatar.Fallback className="text-[8px] font-bold text-[#1B5E20]">
                        {getInitials(member.display_name)}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    {member.display_name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Pinned messages */}
      {pinnedMessages.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50/50 px-4 py-2">
          <div className="mx-auto max-w-3xl">
            {pinnedMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2 text-xs">
                <Pin className="h-3 w-3 mt-0.5 text-amber-600 shrink-0" />
                <span className="text-amber-800">
                  <strong>{msg.sender?.display_name}:</strong> {msg.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {messages.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20]/10">
                <Users className="h-7 w-7 text-[#1B5E20]" />
              </div>
              <p className="text-sm font-medium text-[#0A2E12]">
                Welcome to {club.name} Chat
              </p>
              <p className="mt-1 text-xs text-[#3D5A3E]">
                Start a conversation with your club members
              </p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentPlayer.id;
            const senderData = msg.sender ?? members.find((m) => m.id === msg.sender_id);
            const showAvatar =
              !isMe &&
              (idx === 0 || messages[idx - 1]?.sender_id !== msg.sender_id);

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && showAvatar && (
                  <Link
                    href={`/profile/${msg.sender_id}`}
                    className="mr-2 shrink-0 self-end"
                  >
                    <Avatar.Root className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#1B5E20]/10">
                      <Avatar.Image
                        src={senderData?.avatar_url ?? undefined}
                        alt={senderData?.display_name ?? ""}
                        className="h-full w-full object-cover"
                      />
                      <Avatar.Fallback className="text-[9px] font-bold text-[#1B5E20]">
                        {getInitials(senderData?.display_name ?? "?")}
                      </Avatar.Fallback>
                    </Avatar.Root>
                  </Link>
                )}
                {!isMe && !showAvatar && <div className="mr-2 w-7 shrink-0" />}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? "bg-[#1B5E20] text-white rounded-br-md"
                      : "bg-white border border-[#0A2E12]/10 text-[#0A2E12] rounded-bl-md"
                  }`}
                >
                  {!isMe && showAvatar && (
                    <p className="mb-0.5 text-[10px] font-semibold text-[#1B5E20]">
                      {senderData?.display_name ?? "Unknown"}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                  <p
                    className={`mt-1 text-[10px] ${
                      isMe ? "text-white/60" : "text-[#3D5A3E]/60"
                    }`}
                  >
                    {timeAgo(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <div className="sticky bottom-0 border-t border-[#0A2E12]/10 bg-white/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3"
        >
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Message your club..."
            className="flex-1 rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] px-4 py-3 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E]/40 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20] min-h-[44px]"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || sending}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B5E20] text-white transition-colors hover:bg-[#2E7D32] disabled:opacity-40 min-h-[44px]"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
