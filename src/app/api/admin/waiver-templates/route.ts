import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import {
  listWaiverTemplates,
  createWaiverTemplate,
  updateWaiverTemplate,
} from "@/lib/db/waiver-templates";
import { getVenue } from "@/lib/db/venues";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const venue = await getVenue();
    if (!venue) {
      return NextResponse.json({ templates: [] });
    }

    const templates = await listWaiverTemplates(venue.id);
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("List waiver templates error:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const venue = await getVenue();
    if (!venue) {
      return NextResponse.json({ error: "No venue configured" }, { status: 400 });
    }

    const { title, body, is_active } = await request.json();

    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    const template = await createWaiverTemplate({
      venue_id: venue.id,
      title: title.trim(),
      body: body.trim(),
      is_active: is_active ?? true,
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Create waiver template error:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, title, body, is_active } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Template id is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title.trim();
    if (body !== undefined) updates.body = body.trim();
    if (is_active !== undefined) updates.is_active = is_active;

    const template = await updateWaiverTemplate(id, updates);
    return NextResponse.json({ template });
  } catch (error) {
    console.error("Update waiver template error:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}
