interface DigestData {
  playerName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  upcomingGames: Array<{ title: string; scheduledAt: string }>;
}

export function weeklyDigestEmail(data: DigestData) {
  const upcomingHtml = data.upcomingGames.length > 0
    ? data.upcomingGames.map((g) => {
        const date = new Date(g.scheduledAt).toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
        });
        return `<li style="color:#a1a1aa;padding:4px 0">${g.title} - ${date}</li>`;
      }).join("")
    : '<li style="color:#52525b">No upcoming games</li>';

  return {
    subject: `Your Weekly Recap: ${data.gamesPlayed} games played`,
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
      <h2 style="color:#fafafa;font-size:22px;margin:0 0 20px">Weekly Recap, ${data.playerName}</h2>
      <div style="display:flex;gap:12px;margin-bottom:24px">
        <div style="flex:1;background:#27272a;border-radius:12px;padding:16px;text-align:center">
          <p style="color:#22c55e;font-size:28px;font-weight:700;margin:0">${data.gamesPlayed}</p>
          <p style="color:#71717a;font-size:12px;margin:4px 0 0">Games</p>
        </div>
        <div style="flex:1;background:#27272a;border-radius:12px;padding:16px;text-align:center">
          <p style="color:#22c55e;font-size:28px;font-weight:700;margin:0">${data.wins}</p>
          <p style="color:#71717a;font-size:12px;margin:4px 0 0">Wins</p>
        </div>
        <div style="flex:1;background:#27272a;border-radius:12px;padding:16px;text-align:center">
          <p style="color:#f59e0b;font-size:28px;font-weight:700;margin:0">${data.winRate}%</p>
          <p style="color:#71717a;font-size:12px;margin:4px 0 0">Win Rate</p>
        </div>
      </div>
      <h3 style="color:#fafafa;font-size:16px;margin:0 0 12px">Upcoming Games</h3>
      <ul style="list-style:none;padding:0;margin:0 0 24px">${upcomingHtml}</ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://lawnbowl.app'}/stats"
         style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:16px">
        View Full Stats
      </a>
    </div>
  </div>
</body>
</html>`,
  };
}
