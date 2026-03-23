import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import { getVenue, updateVenue } from "@/lib/db/venues";
import type { Venue } from "@/lib/types";
import { validateBody, isValidationError } from "@/lib/schemas/validate";
import { venueUpdateSchema } from "@/lib/schemas";

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
    return NextResponse.json({ venue });
  } catch (error) {
    console.error("Get venue error:", error);
    return NextResponse.json({ error: "Failed to fetch venue" }, { status: 500 });
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

    const result = await validateBody(request, venueUpdateSchema);
    if (isValidationError(result)) return result;

    const { id, ...rest } = result;

    // Pick only allowed fields
    const allowedFields = [
      "name", "address", "timezone", "sports",
      "contact_email", "contact_phone", "website_url",
      "tagline", "logo_url", "primary_color", "secondary_color",
    ] as const;

    const updates: Partial<Venue> = {};
    for (const field of allowedFields) {
      if ((rest as Record<string, unknown>)[field] !== undefined) {
        (updates as Record<string, unknown>)[field] = (rest as Record<string, unknown>)[field];
      }
    }

    const venue = await updateVenue(id, updates);
    return NextResponse.json({ venue });
  } catch (error) {
    console.error("Update venue error:", error);
    return NextResponse.json({ error: "Failed to update venue" }, { status: 500 });
  }
}
