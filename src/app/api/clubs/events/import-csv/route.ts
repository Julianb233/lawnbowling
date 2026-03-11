import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ClubEventType } from "@/lib/types";

const VALID_EVENT_TYPES: ClubEventType[] = ["social", "tournament", "meeting", "practice", "other"];

interface CsvRow {
  title: string;
  date: string;
  start_time?: string;
  end_time?: string;
  type?: string;
  description?: string;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^['"]|['"]$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });

    if (!row.title || !row.date) continue;

    rows.push({
      title: row.title,
      date: row.date,
      start_time: row.start_time || row["start time"] || undefined,
      end_time: row.end_time || row["end time"] || undefined,
      type: row.type || row.event_type || undefined,
      description: row.description || undefined,
    });
  }

  return rows;
}

function normalizeDate(dateStr: string): string | null {
  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  // Try MM/DD/YYYY
  const mdyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    return `${mdyMatch[3]}-${mdyMatch[1].padStart(2, "0")}-${mdyMatch[2].padStart(2, "0")}`;
  }

  // Try DD/MM/YYYY
  const dmyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, "0")}-${dmyMatch[1].padStart(2, "0")}`;
  }

  // Try Date.parse fallback
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (!player || player.role !== "admin") {
      return NextResponse.json({ error: "Only admins can import events" }, { status: 403 });
    }

    const body = await request.json();
    const { club_id, csv_content } = body as { club_id: string; csv_content: string };

    if (!club_id || !csv_content) {
      return NextResponse.json({ error: "club_id and csv_content are required" }, { status: 400 });
    }

    const rows = parseCsv(csv_content);
    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid rows found in CSV" }, { status: 400 });
    }

    const events = rows
      .map((row) => {
        const eventDate = normalizeDate(row.date);
        if (!eventDate) return null;

        const eventType = (row.type?.toLowerCase() || "other") as ClubEventType;

        return {
          club_id,
          title: row.title,
          description: row.description || null,
          event_date: eventDate,
          start_time: row.start_time || null,
          end_time: row.end_time || null,
          event_type: VALID_EVENT_TYPES.includes(eventType) ? eventType : "other",
          location: null,
          created_by: player.id,
        };
      })
      .filter(Boolean);

    if (events.length === 0) {
      return NextResponse.json({ error: "No valid events could be parsed" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("club_events")
      .insert(events)
      .select();

    if (error) throw error;

    return NextResponse.json({
      imported: data?.length ?? 0,
      total_rows: rows.length,
      events: data,
    }, { status: 201 });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: "Failed to import events" }, { status: 500 });
  }
}
