export function clubClaimApprovedEmail(
  playerName: string,
  clubName: string,
  clubSlug: string,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lawnbowl.app";
  return {
    subject: `Your club claim for ${clubName} has been approved!`,
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
      <h2 style="color:#22c55e;font-size:22px;margin:0 0 16px">🎉 Claim Approved!</h2>
      <p style="color:#a1a1aa;font-size:16px;line-height:1.6;margin:0 0 20px">
        Hey ${playerName}, your claim for <strong style="color:#22c55e">${clubName}</strong> has been
        <strong style="color:#22c55e">approved</strong>. You are now the club director and can manage
        members, events, and settings.
      </p>
      <a href="${appUrl}/clubs/${clubSlug}/manage"
         style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:16px">
        Manage Your Club
      </a>
    </div>
    <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px">
      Lawnbowling - Find your perfect match on the court
    </p>
  </div>
</body>
</html>`,
  };
}

export function clubClaimRejectedEmail(
  playerName: string,
  clubName: string,
  reason: string | null,
) {
  return {
    subject: `Update on your club claim for ${clubName}`,
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
      <h2 style="color:#fafafa;font-size:22px;margin:0 0 16px">Claim Not Approved</h2>
      <p style="color:#a1a1aa;font-size:16px;line-height:1.6;margin:0 0 20px">
        Hey ${playerName}, we were unable to approve your claim for
        <strong style="color:#fafafa">${clubName}</strong> at this time.
      </p>
      ${reason ? `<div style="background:#27272a;border-radius:8px;padding:16px;margin:16px 0"><p style="color:#d4d4d8;font-size:14px;line-height:1.6;margin:0"><strong style="color:#fafafa">Reason:</strong><br>${reason}</p></div>` : ""}
      <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:16px 0 0">
        If you believe this is an error or have additional information, please contact support.
      </p>
    </div>
    <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px">
      Lawnbowling - Find your perfect match on the court
    </p>
  </div>
</body>
</html>`,
  };
}
