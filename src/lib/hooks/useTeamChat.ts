"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TeamMessage } from "@/lib/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type MessageWithSender = TeamMessage & {
  sender: { id: string; name: string; avatar_url: string | null };
};

export function useTeamChat(teamId: string | null) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchMessages = useCallback(async () => {
    if (!teamId) return;
    const supabase = supabaseRef.current;
    const { data, error } = await supabase
      .from("team_messages")
      .select("*, sender:players!team_messages_sender_id_fkey(id, name, avatar_url)")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setMessages((data as MessageWithSender[]).reverse());
    }
    setLoading(false);
  }, [teamId]);

  useEffect(() => {
    if (!teamId) return;
    fetchMessages();

    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`team-chat-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "team_messages",
          filter: `team_id=eq.${teamId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const newMsg = payload.new as TeamMessage;
          // Fetch sender info
          const { data: sender } = await supabase
            .from("players")
            .select("id, name, avatar_url")
            .eq("id", newMsg.sender_id)
            .single();

          if (sender) {
            setMessages((prev) => [
              ...prev,
              { ...newMsg, sender } as MessageWithSender,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, fetchMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!teamId) return;
      await fetch(`/api/teams/${teamId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    },
    [teamId]
  );

  return { messages, loading, sendMessage, refetch: fetchMessages };
}
