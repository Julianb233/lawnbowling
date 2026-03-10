import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import {
  getActiveWaiverTemplate,
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
    const template = venue ? await getActiveWaiverTemplate(venue.id) : null;

    return NextResponse.json({
      template: template
        ? { id: template.id, title: template.title, body: template.body, is_active: template.is_active }
        : null,
    });
  } catch (error) {
    console.error("Get waiver template error:", error);
    return NextResponse.json({ error: "Failed to fetch waiver template" }, { status: 500 });
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

    const body = await request.json();
    const { venue_id, id, title, body: waiverBody } = body;

    if (!venue_id) {
      return NextResponse.json({ error: "venue_id is required" }, { status: 400 });
    }

    if (!title || !waiverBody) {
      return NextResponse.json({ error: "title and body are required" }, { status: 400 });
    }

    let template;
    if (id) {
      // Update existing template
      template = await updateWaiverTemplate(id, {
        title,
        body: waiverBody,
        is_active: true,
      });
    } else {
      // Create new template
      template = await createWaiverTemplate({
        venue_id,
        title,
        body: waiverBody,
        is_active: true,
      });
    }

    return NextResponse.json({
      template: { id: template.id, title: template.title, body: template.body, is_active: template.is_active },
    });
  } catch (error) {
    console.error("Update waiver template error:", error);
    return NextResponse.json({ error: "Failed to update waiver template" }, { status: 500 });
  }
}
