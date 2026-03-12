import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Escape a value for safe CSV output (prevents formula injection and handles special chars) */
function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  let str = String(value);
  // Strip formula-triggering prefixes to prevent spreadsheet injection
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  // If the value contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    str = '"' + str.replace(/"/g, '""') + '"';
  } else if (str.includes('"')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify admin — use user_id (auth UID), not id (player UUID)
  const { data: player } = await supabase.from("players").select("role").eq("user_id", user.id).single();
  if (!player || player.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const type = request.nextUrl.searchParams.get("type") || "players";
  let csv = "";

  if (type === "players") {
    const { data } = await supabase.from("players").select("id, name, skill_level, sports, is_available, role, created_at");
    csv = "id,name,skill_level,sports,is_available,role,created_at\n";
    csv += (data || []).map(r =>
      `${r.id},${escapeCsv(r.name)},${escapeCsv(r.skill_level)},${escapeCsv((r.sports || []).join(";"))},${r.is_available},${escapeCsv(r.role)},${r.created_at}`
    ).join("\n");
  } else if (type === "matches") {
    const { data } = await supabase.from("matches").select("id, sport, status, started_at, ended_at, created_at");
    csv = "id,sport,status,started_at,ended_at,created_at\n";
    csv += (data || []).map(r =>
      `${r.id},${escapeCsv(r.sport)},${escapeCsv(r.status)},${r.started_at || ""},${r.ended_at || ""},${r.created_at}`
    ).join("\n");
  } else if (type === "waivers") {
    const { data } = await supabase.from("waivers").select("id, player_id, accepted, accepted_at, created_at");
    csv = "id,player_id,accepted,accepted_at,created_at\n";
    csv += (data || []).map(r =>
      `${r.id},${r.player_id},${r.accepted},${r.accepted_at || ""},${r.created_at}`
    ).join("\n");
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}-export.csv"`,
    },
  });
}
