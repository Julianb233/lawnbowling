export function outreachFederationEmail(
  federationName: string,
  contactName: string,
  country: string,
  clubCount: number
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lawnbowl.app";

  return {
    subject: `Partnership proposal — Lawnbowling x ${federationName}`,
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
      <h2 style="color:#0A2E12;font-size:22px;margin:0 0 8px;font-weight:700">
        Partnership Proposal
      </h2>
      <p style="color:#3D5A3E;font-size:16px;line-height:1.6;margin:0 0 20px">
        Dear${contactName ? ` ${contactName}` : ""},
      </p>
      <p style="color:#3D5A3E;font-size:16px;line-height:1.6;margin:0 0 20px">
        I am writing to propose a partnership between <strong>${federationName}</strong> and
        <strong>Lawnbowling</strong>, the digital platform for lawn bowling clubs.
      </p>
      <p style="color:#3D5A3E;font-size:16px;line-height:1.6;margin:0 0 20px">
        We have identified <strong>${clubCount.toLocaleString()} clubs</strong> in ${country} that could benefit
        from our free platform. A federation-level partnership would allow us to onboard them
        efficiently while providing ${federationName} with valuable data and engagement tools.
      </p>

      <div style="background:#f0fdf4;border-radius:12px;padding:24px;margin-bottom:24px">
        <h3 style="color:#1B5E20;font-size:16px;margin:0 0 12px;font-weight:600">What the partnership includes</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#3D5A3E;font-size:14px"><strong>For ${federationName}:</strong></td></tr>
          <tr><td style="padding:4px 0 4px 16px;color:#3D5A3E;font-size:14px">&#10003; National dashboard with aggregate club activity data</td></tr>
          <tr><td style="padding:4px 0 4px 16px;color:#3D5A3E;font-size:14px">&#10003; Federation branding on all affiliated club pages</td></tr>
          <tr><td style="padding:4px 0 4px 16px;color:#3D5A3E;font-size:14px">&#10003; Centralized tournament coordination tools</td></tr>
          <tr><td style="padding:4px 0 4px 16px;color:#3D5A3E;font-size:14px">&#10003; Player engagement and growth metrics</td></tr>
          <tr><td style="padding:12px 0 4px;color:#3D5A3E;font-size:14px"><strong>For member clubs:</strong></td></tr>
          <tr><td style="padding:4px 0 4px 16px;color:#3D5A3E;font-size:14px">&#10003; Free digital club management platform</td></tr>
          <tr><td style="padding:4px 0 4px 16px;color:#3D5A3E;font-size:14px">&#10003; Player matchmaking and social features</td></tr>
          <tr><td style="padding:4px 0 4px 16px;color:#3D5A3E;font-size:14px">&#10003; Automated tournament management</td></tr>
          <tr><td style="padding:4px 0 4px 16px;color:#3D5A3E;font-size:14px">&#10003; QR code venue check-in system</td></tr>
        </table>
      </div>

      <p style="color:#3D5A3E;font-size:15px;line-height:1.6;margin:0 0 24px">
        Could we schedule a 30-minute call to discuss how this could work for ${federationName}?
      </p>

      <div style="text-align:center;margin-bottom:16px">
        <a href="${appUrl}/partnerships?federation=${encodeURIComponent(federationName)}&country=${encodeURIComponent(country)}"
           style="display:inline-block;background:#1B5E20;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:16px">
          Schedule a Call
        </a>
      </div>
    </div>

    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:24px;line-height:1.5">
      Lawnbowling &mdash; The platform for lawn bowling clubs worldwide<br>
      <a href="${appUrl}" style="color:#9ca3af;text-decoration:underline">lawnbowl.app</a>
    </p>
  </div>
</body>
</html>`,
  };
}
