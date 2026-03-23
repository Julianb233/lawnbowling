export function clubClaimSubmittedEmail(
  claimerName: string,
  clubName: string,
  clubCity: string,
  roleAtClub: string | null,
  message: string | null,
  adminUrl: string,
) {
  return {
    subject: `New club claim: ${clubName} — review required`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="text-align:center;margin-bottom:32px">
      <h1 style="color:#22c55e;font-size:28px;margin:0">Lawnbowling</h1>
    </div>
    <div style="background:#18181b;border-radius:16px;padding:32px;border:1px solid #27272a">
      <h2 style="color:#fafafa;font-size:22px;margin:0 0 16px">New Club Claim Request</h2>
      <p style="color:#a1a1aa;font-size:16px;line-height:1.6;margin:0 0 20px">
        <strong style="color:#fafafa">${claimerName}</strong> has submitted a claim for
        <strong style="color:#22c55e">${clubName}</strong>${clubCity ? ` (${clubCity})` : ""}.
      </p>
      ${roleAtClub ? `<p style="color:#a1a1aa;font-size:14px;margin:0 0 8px"><strong style="color:#fafafa">Role at club:</strong> ${roleAtClub}</p>` : ""}
      ${message ? `<div style="background:#27272a;border-radius:8px;padding:16px;margin:16px 0"><p style="color:#d4d4d8;font-size:14px;line-height:1.6;margin:0"><strong style="color:#fafafa">Message:</strong><br>${message}</p></div>` : ""}
      <a href="${adminUrl}"
         style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:16px;margin-top:16px">
        Review Claim
      </a>
    </div>
    <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px">
      Lawnbowling Admin Notification
    </p>
  </div>
</body>
</html>`,
  };
}
