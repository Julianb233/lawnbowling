import { createClient } from "@/lib/supabase/server";
import type { PlayerReport } from "@/lib/types";

export async function createReport(report: {
  reporter_id: string;
  reported_id: string;
  reason: string;
  details?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_reports")
    .insert(report)
    .select()
    .single();

  if (error) throw error;
  return data as PlayerReport;
}

export async function getReports(status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("player_reports")
    .select(
      "*, reporter:players!reporter_id(*), reported:players!reported_id(*)"
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as PlayerReport[];
}

export async function updateReportStatus(
  reportId: string,
  status: string,
  adminNotes?: string
) {
  const supabase = await createClient();
  const updates: Record<string, string> = { status };
  if (adminNotes) updates.admin_notes = adminNotes;

  const { error } = await supabase
    .from("player_reports")
    .update(updates)
    .eq("id", reportId);

  if (error) throw error;
}
