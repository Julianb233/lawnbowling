import { Resend } from "resend";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const resend = getResend();

  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping email send");
    return { success: false, error: "No API key configured" };
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Lawnbowling <noreply@lawnbowl.app>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Email send failed:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
