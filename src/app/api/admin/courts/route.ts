import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import { listCourts, createCourt, updateCourt, deleteCourt } from "@/lib/db/courts";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await getAuthUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const courts = await listCourts();
  return NextResponse.json({ courts });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { venue_id, name, sport } = await request.json();
  if (!venue_id || !name || !sport) {
    return NextResponse.json(
      { error: "venue_id, name, and sport are required" },
      { status: 400 }
    );
  }

  const court = await createCourt({ venue_id, name, sport });
  return NextResponse.json({ court }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, ...updates } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const court = await updateCourt(id, updates);
  return NextResponse.json({ court });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await deleteCourt(id);
  return NextResponse.json({ success: true });
}
