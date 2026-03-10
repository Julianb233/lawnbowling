import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTeamMessages, sendTeamMessage } from "@/lib/db/team-messages";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const before = url.searchParams.get("before") ?? undefined;
    const limit = parseInt(url.searchParams.get("limit") ?? "50");

    const messages = await getTeamMessages(id, { limit, before });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
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

    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const message = await sendTeamMessage(id, user.id, content.trim());
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
