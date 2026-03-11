import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import {
  getEndorsementCounts,
  getMyEndorsementsFor,
  addEndorsement,
  removeEndorsement,
  ENDORSEMENT_SKILLS,
  type EndorsementSkill,
} from "@/lib/db/endorsements";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const counts = await getEndorsementCounts(id);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const currentPlayer = user ? await getPlayerByUserId(user.id) : null;

    let myEndorsements: EndorsementSkill[] = [];
    if (currentPlayer && currentPlayer.id !== id) {
      myEndorsements = await getMyEndorsementsFor(currentPlayer.id, id);
    }

    return NextResponse.json({ counts, myEndorsements });
  } catch (error) {
    console.error("Get endorsements error:", error);
    return NextResponse.json({ error: "Failed to get endorsements" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentPlayer = await getPlayerByUserId(user.id);
    if (!currentPlayer) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (currentPlayer.id === id) {
      return NextResponse.json({ error: "Cannot endorse yourself" }, { status: 400 });
    }

    const body = await request.json();
    const { skill } = body as { skill: string };

    if (!ENDORSEMENT_SKILLS.some((s) => s.id === skill)) {
      return NextResponse.json({ error: "Invalid skill" }, { status: 400 });
    }

    await addEndorsement(currentPlayer.id, id, skill as EndorsementSkill);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Add endorsement error:", error);
    return NextResponse.json({ error: "Failed to add endorsement" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentPlayer = await getPlayerByUserId(user.id);
    if (!currentPlayer) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");

    if (!skill || !ENDORSEMENT_SKILLS.some((s) => s.id === skill)) {
      return NextResponse.json({ error: "Invalid skill" }, { status: 400 });
    }

    await removeEndorsement(currentPlayer.id, id, skill as EndorsementSkill);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove endorsement error:", error);
    return NextResponse.json({ error: "Failed to remove endorsement" }, { status: 500 });
  }
}
