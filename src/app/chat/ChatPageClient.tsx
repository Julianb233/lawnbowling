"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Avatar from "@radix-ui/react-avatar";
import { ArrowLeft, Send, Search, MessageCircle, Users } from "lucide-react";
import { BottomNav } from "@/components/board/BottomNav";
import { FadeIn } from "@/components/motion/FadeIn";
import type { PlayerProfile } from "@/lib/db/players";

interface Friend {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Conversation {
  friend: Friend;
  lastMessage: string;
  lastAt: string;
  unread: number;
  messages: Message[];
}

interface ChatPageClientProps {
  currentPlayer: PlayerProfile;
  friends: Friend[];
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

/** Client-side chat UI — messages stored in local state */
export function ChatPageClient({ currentPlayer, friends }: ChatPageClientProps) {
  const [conversations, setConversations] = useState<Map<string, Conversation>>(new Map());
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, conversations, scrollToBottom]);

  function openChat(friend: Friend) {
    if (!conversations.has(friend.id)) {
      setConversations((prev) => {
        const next = new Map(prev);
        next.set(friend.id, {
          friend,
          lastMessage: "",
          lastAt: new Date().toISOString(),
          unread: 0,
          messages: [],
        });
        return next;
      });
    }
    setActiveChat(friend.id);
  }

  function sendMessage() {
    if (!messageInput.trim() || !activeChat) return;

    const newMsg: Message = {
      id: crypto.randomUUID(),
      sender_id: currentPlayer.id,
      content: messageInput.trim(),
      created_at: new Date().toISOString(),
    };

    setConversations((prev) => {
      const next = new Map(prev);
      const conv = next.get(activeChat);
      if (conv) {
        next.set(activeChat, {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMsg.content,
          lastAt: newMsg.created_at,
        });
      }
      return next;
    });

    setMessageInput("");
  }

  const filteredFriends = friends.filter((f) =>
    f.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedConversations = Array.from(conversations.values()).sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
  );

  // Active conversation view
  if (activeChat) {
    const conv = conversations.get(activeChat);
    if (!conv) return null;

    return (
      <div className="flex min-h-screen flex-col bg-[#FEFCF9]">
        {/* Chat header */}
        <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <button
              onClick={() => setActiveChat(null)}
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-[#3D5A3E] hover:bg-[#F0FFF4] transition-colors min-h-[44px]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Link href={`/profile/${conv.friend.id}`} className="flex items-center gap-3 min-w-0">
              <Avatar.Root className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1B5E20]/10">
                <Avatar.Image
                  src={conv.friend.avatar_url ?? undefined}
                  alt={conv.friend.display_name}
                  className="h-full w-full object-cover"
                />
                <Avatar.Fallback className="flex h-full w-full items-center justify-center text-xs font-bold text-[#1B5E20]">
                  {getInitials(conv.friend.display_name)}
                </Avatar.Fallback>
              </Avatar.Root>
              <span className="text-sm font-semibold text-[#0A2E12] truncate">
                {conv.friend.display_name}
              </span>
            </Link>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mx-auto max-w-3xl space-y-3">
            {conv.messages.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20]/10">
                  <MessageCircle className="h-7 w-7 text-[#1B5E20]" />
                </div>
                <p className="text-sm text-[#3D5A3E]">
                  Start a conversation with {conv.friend.display_name}
                </p>
              </div>
            )}

            {conv.messages.map((msg) => {
              const isMe = msg.sender_id === currentPlayer.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? "bg-[#1B5E20] text-white rounded-br-md"
                        : "bg-white border border-[#0A2E12]/10 text-[#0A2E12] rounded-bl-md"
                    }`}
                  >
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
              sendMessage();
            }}
            className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3"
          >
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] px-4 py-3 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E]/40 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20] min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B5E20] text-white transition-colors hover:bg-[#2E7D32] disabled:opacity-40 min-h-[44px]"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Conversation list view
  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Hero banner */}
      <div className="relative h-36 w-full overflow-hidden">
        <Image
          src="/images/social-bench-between-games.jpg"
          alt="Bowlers chatting between games"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2E12]/70 to-[#0A2E12]/40" />
        <div className="absolute inset-0 flex items-end px-4 pb-4">
          <div className="mx-auto w-full max-w-3xl">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white tracking-tight">
              Messages
            </h1>
            <p className="text-sm text-[#A8D5BA]">
              Chat with your bowling friends
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full rounded-xl border border-[#0A2E12]/10 bg-white pl-10 pr-4 py-3 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E]/40 focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
          />
        </div>

        {/* Active conversations */}
        {sortedConversations.length > 0 && (
          <FadeIn>
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]">
                Recent Conversations
              </h2>
              <div className="space-y-1">
                {sortedConversations.map((conv) => (
                  <button
                    key={conv.friend.id}
                    onClick={() => setActiveChat(conv.friend.id)}
                    className="flex w-full items-center gap-3 rounded-xl bg-white border border-[#0A2E12]/10 p-3 text-left hover:bg-[#F0FFF4] transition-colors"
                  >
                    <Avatar.Root className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1B5E20]/10">
                      <Avatar.Image
                        src={conv.friend.avatar_url ?? undefined}
                        alt={conv.friend.display_name}
                        className="h-full w-full object-cover"
                      />
                      <Avatar.Fallback className="flex h-full w-full items-center justify-center text-sm font-bold text-[#1B5E20]">
                        {getInitials(conv.friend.display_name)}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#0A2E12] truncate">
                          {conv.friend.display_name}
                        </span>
                        <span className="text-[10px] text-[#3D5A3E]/60 shrink-0 ml-2">
                          {timeAgo(conv.lastAt)}
                        </span>
                      </div>
                      {conv.lastMessage && (
                        <p className="mt-0.5 text-xs text-[#3D5A3E] truncate">
                          {conv.lastMessage}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Friends to start chatting with */}
        <FadeIn delay={0.1}>
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]">
              <Users className="mr-1 inline h-3.5 w-3.5" />
              Friends ({filteredFriends.length})
            </h2>

            {filteredFriends.length === 0 ? (
              <div className="rounded-xl bg-white border border-[#0A2E12]/10 p-8 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-[#3D5A3E]/30" />
                <p className="text-sm text-[#3D5A3E]">
                  {friends.length === 0
                    ? "Add friends to start chatting"
                    : "No friends match your search"}
                </p>
                {friends.length === 0 && (
                  <Link
                    href="/friends"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#1B5E20] hover:underline"
                  >
                    Find friends
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => openChat(friend)}
                    className="flex w-full items-center gap-3 rounded-xl bg-white border border-[#0A2E12]/10 p-3 text-left hover:bg-[#F0FFF4] transition-colors"
                  >
                    <Avatar.Root className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1B5E20]/10">
                      <Avatar.Image
                        src={friend.avatar_url ?? undefined}
                        alt={friend.display_name}
                        className="h-full w-full object-cover"
                      />
                      <Avatar.Fallback className="flex h-full w-full items-center justify-center text-xs font-bold text-[#1B5E20]">
                        {getInitials(friend.display_name)}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <span className="text-sm font-medium text-[#0A2E12] truncate">
                      {friend.display_name}
                    </span>
                    <MessageCircle className="ml-auto h-4 w-4 shrink-0 text-[#1B5E20]/40" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      <BottomNav />
    </div>
  );
}
