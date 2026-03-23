import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates/welcome";
import { matchReminderEmail } from "@/lib/email/templates/match-reminder";
import { partnerRequestEmail } from "@/lib/email/templates/partner-request";
import { gameRsvpEmail } from "@/lib/email/templates/game-rsvp";
import { weeklyDigestEmail } from "@/lib/email/templates/weekly-digest";
import { tournamentNotificationEmail } from "@/lib/email/templates/tournament-notification";
import { orderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { clubInviteEmail } from "@/lib/email/templates/club-invite";
import { validateBody, isValidationError } from "@/lib/schemas/validate";
import { emailSendSchema } from "@/lib/schemas";

type TemplateData = Record<string, string | number>;

const TEMPLATES: Record<string, (data: TemplateData) => { subject: string; html: string }> = {
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
  "weekly-digest": (d) => weeklyDigestEmail({
    playerName: d.playerName as string,
    gamesPlayed: d.gamesPlayed as number,
    wins: d.wins as number,
    losses: d.losses as number,
    winRate: d.winRate as number,
    upcomingGames: JSON.parse((d.upcomingGames as string) || "[]"),
  }),
  "tournament-notification": (d) => tournamentNotificationEmail(
    d.playerName as string, d.tournamentName as string, d.scheduledAt as string, d.venueName as string
  ),
  "order-confirmation": (d) => orderConfirmationEmail(
    d.customerName as string, d.orderId as string, d.orderTotal as string, d.itemsSummary as string
  ),
  "club-invite": (d) => clubInviteEmail(
    d.playerName as string, d.clubName as string, d.inviterName as string, d.clubSlug as string
  ),
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await validateBody(req, emailSendSchema);
  if (isValidationError(result)) return result;

  const templateFn = TEMPLATES[result.template];
  if (!templateFn) {
    return NextResponse.json({ error: "Unknown template" }, { status: 400 });
  }

  const { subject, html } = templateFn(result.data || {});
  const sendResult = await sendEmail({ to: result.to, subject, html });

  if (!sendResult.success) {
    return NextResponse.json({ error: sendResult.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
