import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import { getVenue, updateVenue } from "@/lib/db/venues";

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

    const { id, name, address, timezone } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const venue = await updateVenue(id, { name, address, timezone });
    return NextResponse.json({ venue });
  } catch (error) {
    console.error("Update venue error:", error);
    return NextResponse.json({ error: "Failed to update venue" }, { status: 500 });
  }
}
