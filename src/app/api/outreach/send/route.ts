import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import { sendEmail } from "@/lib/email/send";
import { outreachInitialEmail } from "@/lib/email/templates/outreach-initial";
import { outreachFollowupEmail } from "@/lib/email/templates/outreach-followup";
import { outreachFederationEmail } from "@/lib/email/templates/outreach-federation";

export const dynamic = "force-dynamic";

const TEMPLATES: Record<string, (data: Record<string, string | number>) => { subject: string; html: string }> = {
  "outreach-initial": (d) => outreachInitialEmail(
    d.clubName as string, d.contactName as string, d.country as string
  ),
  "outreach-followup": (d) => outreachFollowupEmail(
    d.clubName as string, d.contactName as string, d.stepNumber as number
  ),
  "outreach-federation": (d) => outreachFederationEmail(
    d.federationName as string, d.contactName as string, d.country as string, d.clubCount as number
  ),
};

/**
 * POST /api/outreach/send — send outreach email to a club
 * Body: { outreachId, templateKey, data }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { outreachId, templateKey, data: templateData } = body;

  if (!outreachId || !templateKey) {
    return NextResponse.json(
      { error: "outreachId and templateKey are required" },
      { status: 400 }
    );
  }

  // Get the outreach record
  const { data: outreach, error: outreachErr } = await supabase
    .from("club_outreach")
    .select("*, clubs:club_id (name, city, country, country_code)")
    .eq("id", outreachId)
    .single();

  if (outreachErr || !outreach) {
    return NextResponse.json({ error: "Outreach record not found" }, { status: 404 });
  }

  if (!outreach.contact_email) {
    return NextResponse.json({ error: "No contact email set" }, { status: 400 });
  }

  const templateFn = TEMPLATES[templateKey];
  if (!templateFn) {
    return NextResponse.json({ error: `Unknown template: ${templateKey}` }, { status: 400 });
  }

  // Build template data with club info
  const club = outreach.clubs as Record<string, string> | null;
  const mergedData = {
    clubName: club?.name || "",
    contactName: outreach.contact_name || "",
    country: club?.country || "",
    ...templateData,
  };

  const { subject, html } = templateFn(mergedData);

  // Send the email
  const sendResult = await sendEmail({
    to: outreach.contact_email,
    subject,
    html,
  });

  if (!sendResult.success) {
    return NextResponse.json({ error: sendResult.error }, { status: 500 });
  }

  // Log the sent email
  await supabase.from("outreach_emails").insert({
    club_outreach_id: outreachId,
    campaign_id: outreach.campaign_id,
    sequence_step: templateData?.stepNumber || null,
    to_email: outreach.contact_email,
    subject,
    resend_message_id: sendResult.messageId || null,
    status: "sent",
  });

  // Update outreach status
  await supabase
    .from("club_outreach")
    .update({
      status: outreach.status === "not_contacted" ? "contacted" : outreach.status,
      last_contacted_at: new Date().toISOString(),
      current_sequence_step: (outreach.current_sequence_step || 0) + 1,
      next_followup_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq("id", outreachId);

  // Update campaign sent count
  if (outreach.campaign_id) {
    await supabase.rpc("increment_campaign_sent", { cid: outreach.campaign_id });
  }

  return NextResponse.json({ success: true, messageId: sendResult.messageId });
}
