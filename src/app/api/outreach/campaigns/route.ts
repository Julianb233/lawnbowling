import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/outreach/campaigns — list campaigns with stats
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("outreach_campaign_stats")
    .select("*")
    .order("campaign_id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

/**
 * POST /api/outreach/campaigns — create a new campaign
 * Body: { name, description?, countryCode?, templateKey, subjectLine }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, countryCode, templateKey, subjectLine } = body;

  if (!name || !templateKey || !subjectLine) {
    return NextResponse.json(
      { error: "name, templateKey, and subjectLine are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("outreach_campaigns")
    .insert({
      name,
      description: description || null,
      country_code: countryCode || null,
      template_key: templateKey,
      subject_line: subjectLine,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
