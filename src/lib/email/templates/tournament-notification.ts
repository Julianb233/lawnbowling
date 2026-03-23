export function tournamentNotificationEmail(
  playerName: string,
  tournamentName: string,
  scheduledAt: string,
  venueName: string,
) {
  const date = new Date(scheduledAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return {
    subject: `Tournament Update: ${tournamentName}`,
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
      <h2 style="color:#fafafa;font-size:22px;margin:0 0 16px">Tournament Alert, ${playerName}!</h2>
      <p style="color:#a1a1aa;font-size:16px;line-height:1.6;margin:0 0 20px">
        A tournament you're registered for is coming up:
      </p>
      <div style="background:#27272a;border-radius:12px;padding:20px;margin:0 0 24px">
        <p style="color:#fafafa;font-size:18px;font-weight:600;margin:0 0 8px">${tournamentName}</p>
        <p style="color:#a1a1aa;font-size:14px;margin:0 0 4px">${date}</p>
        <p style="color:#a1a1aa;font-size:14px;margin:0">${venueName}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://lawnbowl.app"}/tournaments"
         style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:16px">
        View Tournament
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
