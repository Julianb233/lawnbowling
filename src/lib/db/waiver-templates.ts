import { createClient } from "@/lib/supabase/server";
import type { WaiverTemplate } from "@/lib/types";

export type WaiverTemplateInsert = Omit<WaiverTemplate, "id" | "created_at" | "updated_at">;
export type WaiverTemplateUpdate = Partial<Omit<WaiverTemplate, "id" | "venue_id" | "created_at" | "updated_at">>;

export async function getActiveWaiverTemplate(venueId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("waiver_templates")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { data, error } = await query.single();
  if (error && error.code !== "PGRST116") throw error;
  return data as WaiverTemplate | null;
}

export async function listWaiverTemplates(venueId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("waiver_templates")
    .select("*")
    .eq("venue_id", venueId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data as WaiverTemplate[];
}

export async function createWaiverTemplate(template: WaiverTemplateInsert) {
  const supabase = await createClient();

  // If this template is active, deactivate others for same venue
  if (template.is_active) {
    await supabase
      .from("waiver_templates")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("venue_id", template.venue_id)
      .eq("is_active", true);
  }

  const { data, error } = await supabase
    .from("waiver_templates")
    .insert(template)
    .select()
    .single();

  if (error) throw error;
  return data as WaiverTemplate;
}

export async function updateWaiverTemplate(id: string, updates: WaiverTemplateUpdate) {
  const supabase = await createClient();

  // If activating this template, deactivate others for same venue
  if (updates.is_active) {
    const { data: existing } = await supabase
      .from("waiver_templates")
      .select("venue_id")
      .eq("id", id)
      .single();

    if (existing) {
      await supabase
        .from("waiver_templates")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("venue_id", existing.venue_id)
        .eq("is_active", true)
        .neq("id", id);
    }
  }

  const { data, error } = await supabase
    .from("waiver_templates")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as WaiverTemplate;
}
