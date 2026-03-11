interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const apiKey = process.env.EMAIL_API_KEY;

  if (!apiKey) {
    console.warn("EMAIL_API_KEY not set, skipping email send");
    return { success: false, error: "No API key configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Lawnbowling <noreply@lawnbowl.app>",
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Email send failed:", err);
    return { success: false, error: err };
  }

  return { success: true };
}
