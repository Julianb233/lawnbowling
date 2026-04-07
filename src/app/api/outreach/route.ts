import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/outreach — list club outreach records with filters
 * Query params: status, campaign_id, country_code, limit, offset
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const campaignId = searchParams.get("campaign_id");
  const countryCode = searchParams.get("country_code");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("club_outreach")
    .select(`
      *,
      clubs:club_id (id, name, city, country, country_code),
      campaign:campaign_id (id, name)
    `, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (campaignId) query = query.eq("campaign_id", campaignId);
  if (countryCode) {
    query = query.eq("clubs.country_code", countryCode);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, total: count });
}

/**
 * POST /api/outreach — create or update a club outreach record
 * Body: { clubId, campaignId?, contactEmail?, contactName?, status?, notes? }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { clubId, campaignId, contactEmail, contactName, status, notes } = body;

  if (!clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("club_outreach")
    .upsert({
      club_id: clubId,
      campaign_id: campaignId || null,
      contact_email: contactEmail || null,
      contact_name: contactName || null,
      status: status || "not_contacted",
      notes: notes || null,
    }, { onConflict: "club_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
