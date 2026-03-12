import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates/welcome";
import { matchReminderEmail } from "@/lib/email/templates/match-reminder";
import { partnerRequestEmail } from "@/lib/email/templates/partner-request";
import { gameRsvpEmail } from "@/lib/email/templates/game-rsvp";

const TEMPLATES: Record<string, (data: Record<string, string | number>) => { subject: string; html: string }> = {
  welcome: (d) => welcomeEmail(d.playerName as string),
  "match-reminder": (d) => matchReminderEmail(
    d.playerName as string, d.gameTitle as string, d.scheduledAt as string, d.venueName as string
  ),
  "partner-request": (d) => partnerRequestEmail(
    d.playerName as string, d.requesterName as string, d.sport as string
  ),
  "game-rsvp": (d) => gameRsvpEmail(
    d.organizerName as string, d.gameTitle as string, d.rsvpCount as number, d.scheduledAt as string
  ),
};

export async function POST(req: NextRequest) {
  // Require authentication to prevent open relay abuse
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { to, template, data } = await req.json();

  if (!to || !template) {
    return NextResponse.json({ error: "Missing to or template" }, { status: 400 });
  }

  const templateFn = TEMPLATES[template];
  if (!templateFn) {
    return NextResponse.json({ error: "Unknown template" }, { status: 400 });
  }

  const { subject, html } = templateFn(data || {});
  const result = await sendEmail({ to, subject, html });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
