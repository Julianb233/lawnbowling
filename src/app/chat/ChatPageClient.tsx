"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Avatar from "@radix-ui/react-avatar";
import { ArrowLeft, Send, Search, MessageCircle, Users } from "lucide-react";
import { BottomNav } from "@/components/board/BottomNav";
import { FadeIn } from "@/components/motion/FadeIn";
import { createClient } from "@/lib/supabase/client";
import type { PlayerProfile } from "@/lib/db/players";
import type { DirectMessage, ConversationSummary } from "@/lib/db/messages";

interface Friend {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

interface ChatPageClientProps {
  currentPlayer: PlayerProfile;
  friends: Friend[];
  initialConversations: ConversationSummary[];
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

/** Client-side chat UI with database persistence & realtime */
export function ChatPageClient({ currentPlayer, friends, initialConversations }: ChatPageClientProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Subscribe to realtime messages
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("direct-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `receiver_id=eq.${currentPlayer.id}`,
        },
        (payload) => {
          const newMsg = payload.new as DirectMessage;
          // If currently viewing this conversation, add the message
          if (activeChat === newMsg.sender_id) {
            setMessages((prev) => [...prev, newMsg]);
            // Mark as read
            fetch("/api/messages/read", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ friend_id: newMsg.sender_id }),
            });
          }
          // Update conversation list
          setConversations((prev) => {
            const updated = [...prev];
            const idx = updated.findIndex((c) => c.friend_id === newMsg.sender_id);
            if (idx >= 0) {
              updated[idx] = {
                ...updated[idx],
                last_message: newMsg.content,
                last_message_at: newMsg.created_at,
                unread_count: activeChat === newMsg.sender_id
                  ? updated[idx].unread_count
                  : updated[idx].unread_count + 1,
              };
            } else {
              // New conversation from someone
              const friend = friends.find((f) => f.id === newMsg.sender_id);
              if (friend) {
                updated.unshift({
                  friend_id: friend.id,
                  friend_display_name: friend.display_name,
                  friend_avatar_url: friend.avatar_url,
                  last_message: newMsg.content,
                  last_message_at: newMsg.created_at,
                  unread_count: activeChat === newMsg.sender_id ? 0 : 1,
                });
              }
            }
            return updated.sort(
              (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPlayer.id, activeChat, friends]);

  async function openChat(friend: Friend) {
    setActiveChat(friend.id);
    setActiveFriend(friend);
    setLoading(true);
    try {
      const res = await fetch(`/api/messages?friendId=${friend.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
      // Mark messages as read
      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friend_id: friend.id }),
      });
      // Clear unread count in conversation list
      setConversations((prev) =>
        prev.map((c) => c.friend_id === friend.id ? { ...c, unread_count: 0 } : c)
      );
    } catch {
      // Failed to load — will show empty
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!messageInput.trim() || !activeChat || sending) return;

    const content = messageInput.trim();
    setMessageInput("");
    setSending(true);

    // Optimistic update
    const optimisticMsg: DirectMessage = {
      id: crypto.randomUUID(),
      sender_id: currentPlayer.id,
      receiver_id: activeChat,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: activeChat, content }),
      });
      if (res.ok) {
        const savedMsg = await res.json();
        // Replace optimistic with real
        setMessages((prev) =>
          prev.map((m) => m.id === optimisticMsg.id ? savedMsg : m)
        );
        // Update conversation list
        setConversations((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((c) => c.friend_id === activeChat);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], last_message: content, last_message_at: savedMsg.created_at };
          } else if (activeFriend) {
            updated.unshift({
              friend_id: activeFriend.id,
              friend_display_name: activeFriend.display_name,
              friend_avatar_url: activeFriend.avatar_url,
              last_message: content,
              last_message_at: savedMsg.created_at,
              unread_count: 0,
            });
          }
          return updated.sort(
            (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
          );
        });
      }
    } catch {
      // Revert optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  }

  const filteredFriends = friends.filter((f) =>
    f.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Active conversation view
  if (activeChat && activeFriend) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FEFCF9]">
        {/* Chat header */}
        <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <button
              onClick={() => { setActiveChat(null); setActiveFriend(null); setMessages([]); }}
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-[#3D5A3E] hover:bg-[#F0FFF4] transition-colors min-h-[44px]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Link href={`/profile/${activeFriend.id}`} className="flex items-center gap-3 min-w-0">
              <Avatar.Root className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1B5E20]/10">
                <Avatar.Image
                  src={activeFriend.avatar_url ?? undefined}
                  alt={activeFriend.display_name}
                  className="h-full w-full object-cover"
                />
                <Avatar.Fallback className="flex h-full w-full items-center justify-center text-xs font-bold text-[#1B5E20]">
                  {getInitials(activeFriend.display_name)}
                </Avatar.Fallback>
              </Avatar.Root>
              <span className="text-sm font-semibold text-[#0A2E12] truncate">
                {activeFriend.display_name}
              </span>
            </Link>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mx-auto max-w-3xl space-y-3">
            {loading && (
              <div className="py-16 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#1B5E20] border-t-transparent" />
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20]/10">
                  <MessageCircle className="h-7 w-7 text-[#1B5E20]" />
                </div>
                <p className="text-sm text-[#3D5A3E]">
                  Start a conversation with {activeFriend.display_name}
                </p>
              </div>
            )}

            {messages.map((msg) => {
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
              handleSend();
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
              disabled={!messageInput.trim() || sending}
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
        {conversations.length > 0 && (
          <FadeIn>
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]">
                Recent Conversations
              </h2>
              <div className="space-y-1">
                {conversations
                  .filter((conv) =>
                    conv.friend_display_name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((conv) => {
                    const friend = friends.find((f) => f.id === conv.friend_id) ?? {
                      id: conv.friend_id,
                      display_name: conv.friend_display_name,
                      avatar_url: conv.friend_avatar_url,
                    };
                    return (
                      <button
                        key={conv.friend_id}
                        onClick={() => openChat(friend)}
                        className="flex w-full items-center gap-3 rounded-xl bg-white border border-[#0A2E12]/10 p-3 text-left hover:bg-[#F0FFF4] transition-colors"
                      >
                        <Avatar.Root className="inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1B5E20]/10">
                          <Avatar.Image
                            src={conv.friend_avatar_url ?? undefined}
                            alt={conv.friend_display_name}
                            className="h-full w-full object-cover"
                          />
                          <Avatar.Fallback className="flex h-full w-full items-center justify-center text-sm font-bold text-[#1B5E20]">
                            {getInitials(conv.friend_display_name)}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#0A2E12] truncate">
                              {conv.friend_display_name}
                            </span>
                            <span className="text-[10px] text-[#3D5A3E]/60 shrink-0 ml-2">
                              {timeAgo(conv.last_message_at)}
                            </span>
                          </div>
                          {conv.last_message && (
                            <p className="mt-0.5 text-xs text-[#3D5A3E] truncate">
                              {conv.last_message}
                            </p>
                          )}
                        </div>
                        {conv.unread_count > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1B5E20] px-1.5 text-[10px] font-bold text-white">
                            {conv.unread_count}
                          </span>
                        )}
                      </button>
                    );
                  })}
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
