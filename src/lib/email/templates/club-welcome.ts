export function clubWelcomeEmail(clubName: string, contactName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lawnbowl.app";

  return {
    subject: `Welcome to Lawnbowling, ${clubName}!`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FEFCF9;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:#1B5E20;border-radius:16px;padding:12px 24px">
        <h1 style="color:#fff;font-size:24px;margin:0;letter-spacing:-0.5px">Lawnbowling</h1>
      </div>
    </div>

    <!-- Main Card -->
    <div style="background:#fff;border-radius:20px;padding:36px;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
      <h2 style="color:#0A2E12;font-size:24px;margin:0 0 8px;font-weight:700">
        Welcome aboard, ${contactName}!
      </h2>
      <p style="color:#3D5A3E;font-size:16px;line-height:1.6;margin:0 0 24px">
        <strong>${clubName}</strong> is now registered on Lawnbowling.
        Here is everything you need to get your club up and running on the platform.
      </p>

      <!-- Steps -->
      <div style="background:#f0fdf4;border-radius:12px;padding:24px;margin-bottom:24px">
        <h3 style="color:#1B5E20;font-size:16px;margin:0 0 16px;font-weight:600">Getting Started Checklist</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;color:#1B5E20;font-size:20px">1.</td>
            <td style="padding:8px 0">
              <strong style="color:#0A2E12;font-size:14px">Complete Your Club Profile</strong>
              <p style="color:#3D5A3E;font-size:13px;margin:4px 0 0;line-height:1.5">Add your logo, photos, playing schedule, and contact details so bowlers can find you.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;color:#1B5E20;font-size:20px">2.</td>
            <td style="padding:8px 0">
              <strong style="color:#0A2E12;font-size:14px">Set Up Your Rinks</strong>
              <p style="color:#3D5A3E;font-size:13px;margin:4px 0 0;line-height:1.5">Configure your greens and rinks so members can check availability and book sessions.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;color:#1B5E20;font-size:20px">3.</td>
            <td style="padding:8px 0">
              <strong style="color:#0A2E12;font-size:14px">Invite Your Members</strong>
              <p style="color:#3D5A3E;font-size:13px;margin:4px 0 0;line-height:1.5">Share your club link with members so they can sign up and start finding partners.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;color:#1B5E20;font-size:20px">4.</td>
            <td style="padding:8px 0">
              <strong style="color:#0A2E12;font-size:14px">Create Your First Tournament</strong>
              <p style="color:#3D5A3E;font-size:13px;margin:4px 0 0;line-height:1.5">Set up a round robin or bracket tournament to engage your community.</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align:center;margin-bottom:24px">
        <a href="${appUrl}/clubs/dashboard"
           style="display:inline-block;background:#1B5E20;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:16px;margin-bottom:12px">
          Go to Club Dashboard
        </a>
      </div>

      <!-- Features -->
      <div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:8px">
        <h3 style="color:#0A2E12;font-size:15px;margin:0 0 12px;font-weight:600">What You Get</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:6px 0;color:#3D5A3E;font-size:13px">&#9745; Club profile in the national directory</td>
            <td style="padding:6px 0;color:#3D5A3E;font-size:13px">&#9745; Player matchmaking board</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#3D5A3E;font-size:13px">&#9745; Tournament management</td>
            <td style="padding:6px 0;color:#3D5A3E;font-size:13px">&#9745; Score tracking & leaderboards</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#3D5A3E;font-size:13px">&#9745; QR code venue check-in</td>
            <td style="padding:6px 0;color:#3D5A3E;font-size:13px">&#9745; Member communication tools</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Help -->
    <div style="background:#fff;border-radius:16px;padding:24px;border:1px solid #e5e7eb;margin-top:16px;text-align:center">
      <p style="color:#3D5A3E;font-size:14px;margin:0 0 8px">
        Need help getting set up? We are here for you.
      </p>
      <a href="${appUrl}/contact"
         style="color:#1B5E20;font-size:14px;font-weight:600;text-decoration:none">
        Contact Support &rarr;
      </a>
    </div>

    <!-- Footer -->
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px;line-height:1.5">
      Lawnbowling &mdash; The national platform for lawn bowling clubs<br>
      <a href="${appUrl}" style="color:#9ca3af;text-decoration:underline">lawnbowl.app</a>
    </p>
  </div>
</body>
</html>`,
  };
}
