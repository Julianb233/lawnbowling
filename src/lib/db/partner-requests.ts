import { createClient } from "@/lib/supabase/server";
import type { PartnerRequest, RequestStatus } from "@/lib/types";

export type PartnerRequestInsert = {
  requester_id: string;
  target_id: string;
  sport: string;
  expires_at: string;
};

export async function createPartnerRequest(request: PartnerRequestInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partner_requests")
    .insert({ ...request, status: "pending" as RequestStatus })
    .select()
    .single();

  if (error) throw error;
  return data as PartnerRequest;
}

export async function getPartnerRequest(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partner_requests")
    .select("*, requester:players!requester_id(*), target:players!target_id(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getPendingRequestsForPlayer(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partner_requests")
    .select("*, requester:players!requester_id(*)")
    .eq("target_id", playerId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partner_requests")
    .update({
      status,
      responded_at: status !== "pending" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PartnerRequest;
}

export async function hasPendingRequest(requesterId: string, targetId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partner_requests")
    .select("id")
    .eq("requester_id", requesterId)
    .eq("target_id", targetId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .limit(1);

  if (error) throw error;
  return data.length > 0;
}

export async function expireStaleRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partner_requests")
    .update({ status: "expired" as RequestStatus })
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString())
    .select();

  if (error) throw error;
  return data as PartnerRequest[];
}
