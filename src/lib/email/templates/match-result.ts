export function matchResultEmail(
  playerName: string,
  sport: string,
  venueName: string | null,
  completedAt: string,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lawnbowl.app";
  const date = new Date(completedAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return {
    subject: `Your ${sport} match at ${venueName ?? "the club"} is complete`,
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
      <h2 style="color:#fafafa;font-size:22px;margin:0 0 16px">Match Complete</h2>
      <p style="color:#a1a1aa;font-size:16px;line-height:1.6;margin:0 0 20px">
        Hey ${playerName}, your <strong style="color:#22c55e">${sport}</strong> match
        ${venueName ? `at <strong style="color:#fafafa">${venueName}</strong>` : ""} on
        <strong style="color:#fafafa">${date}</strong> has been marked complete.
      </p>
      <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px">
        Your stats and match history have been updated. Check your profile to see your latest performance.
      </p>
      <a href="${appUrl}/match-history"
         style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:16px">
        View Match History
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
