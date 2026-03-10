import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveWaiverTemplate } from "@/lib/db/waiver-templates";
import { getVenue } from "@/lib/db/venues";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const venue = await getVenue();
    const template = venue ? await getActiveWaiverTemplate(venue.id) : null;

    return NextResponse.json({
      template: template
        ? { title: template.title, body: template.body }
        : null,
      venue_name: venue?.name ?? null,
    });
  } catch (error) {
    console.error("Get waiver template error:", error);
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 });
  }
}
