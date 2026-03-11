export function welcomeEmail(playerName: string) {
  return {
    subject: "Welcome to Lawnbowling!",
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
      <h2 style="color:#fafafa;font-size:22px;margin:0 0 16px">Welcome, ${playerName}!</h2>
      <p style="color:#a1a1aa;font-size:16px;line-height:1.6;margin:0 0 20px">
        You're all set to find your perfect sports partner. Here's how to get started:
      </p>
      <ol style="color:#a1a1aa;font-size:14px;line-height:1.8;padding-left:20px;margin:0 0 24px">
        <li><strong style="color:#fafafa">Check in</strong> when you arrive at a venue</li>
        <li><strong style="color:#fafafa">Browse</strong> available players on the board</li>
        <li><strong style="color:#fafafa">Pick</strong> a partner and send a request</li>
        <li><strong style="color:#fafafa">Play!</strong> Get matched to a court</li>
      </ol>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://pickapartner.app'}/board"
         style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:16px">
        Find a Partner Now
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
