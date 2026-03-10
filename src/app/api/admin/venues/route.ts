import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import { listVenues, createVenue } from "@/lib/db/venues";

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

    const venues = await listVenues();
    return NextResponse.json({ venues });
  } catch (error) {
    console.error("List venues error:", error);
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
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

    const body = await request.json();
    const { name, address, timezone, sports } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const venue = await createVenue({
      name: name.trim(),
      address: address || undefined,
      timezone: timezone || undefined,
      sports: sports || undefined,
    });

    return NextResponse.json({ venue }, { status: 201 });
  } catch (error) {
    console.error("Create venue error:", error);
    return NextResponse.json({ error: "Failed to create venue" }, { status: 500 });
  }
}
