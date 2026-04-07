export function outreachFollowupEmail(
  clubName: string,
  contactName: string,
  stepNumber: number
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lawnbowl.app";

  const subjects: Record<number, string> = {
    1: `Following up — ${clubName} on Lawnbowling`,
    2: `Quick question for ${clubName}`,
    3: `Last note — free platform for ${clubName}`,
  };

  const bodies: Record<number, string> = {
    1: `
      <p style="color:#3D5A3E;font-size:16px;line-height:1.6;margin:0 0 20px">
        Hi${contactName ? ` ${contactName}` : ""}, just following up on my earlier email about Lawnbowling.
        We have had great feedback from clubs who have joined — members love the partner finder and
        tournament features.
      </p>
      <p style="color:#3D5A3E;font-size:16px;line-height:1.6;margin:0 0 20px">
        Would a quick 15-minute call work this week? Happy to show you how it works and answer any questions.
      </p>`,
    2: `
      <p style="color:#3D5A3E;font-size:16px;line-height:1.6;margin:0 0 20px">
        Hi${contactName ? ` ${contactName}` : ""}, I wanted to check in one more time about <strong>${clubName}</strong>
        joining Lawnbowling.
      </p>
      <p style="color:#3D5A3E;font-size:16px;line-height:1.6;margin:0 0 20px">
        Here is what other clubs have found most valuable:
      </p>
      <ul style="color:#3D5A3E;font-size:15px;line-height:1.8;margin:0 0 20px;padding-left:20px">
        <li><strong>30% more social play</strong> from the partner matchmaking board</li>
        <li><strong>Paperless check-in</strong> with QR codes at the green</li>
        <li><strong>Automated tournaments</strong> — no more manual draw sheets</li>
      </ul>`,
    3: `
      <p style="color:#3D5A3E;font-size:16px;line-height:1.6;margin:0 0 20px">
        Hi${contactName ? ` ${contactName}` : ""}, this will be my last note about Lawnbowling.
        I do not want to be a bother — just genuinely think it would be a great fit for <strong>${clubName}</strong>.
      </p>
      <p style="color:#3D5A3E;font-size:16px;line-height:1.6;margin:0 0 20px">
        The platform is free for clubs. If you are ever interested, the link below will always work.
        No pressure at all.
      </p>`,
  };

  const step = Math.min(stepNumber, 3);

  return {
    subject: subjects[step] || subjects[1],
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FEFCF9;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:#1B5E20;border-radius:16px;padding:12px 24px">
        <h1 style="color:#fff;font-size:24px;margin:0;letter-spacing:-0.5px">Lawnbowling</h1>
      </div>
    </div>

    <div style="background:#fff;border-radius:20px;padding:36px;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
      ${bodies[step] || bodies[1]}

      <div style="text-align:center;margin-bottom:16px">
        <a href="${appUrl}/demo?club=${encodeURIComponent(clubName)}"
           style="display:inline-block;background:#1B5E20;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:16px">
          ${step === 3 ? "Learn More" : "Schedule a Demo"}
        </a>
      </div>
    </div>

    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px;line-height:1.5">
      Lawnbowling &mdash; The platform for lawn bowling clubs worldwide<br>
      <a href="${appUrl}" style="color:#9ca3af;text-decoration:underline">lawnbowl.app</a><br>
      <a href="${appUrl}/unsubscribe" style="color:#9ca3af;text-decoration:underline;font-size:11px">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`,
  };
}
