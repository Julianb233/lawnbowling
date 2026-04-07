export function outreachInitialEmail(
  clubName: string,
  contactName: string,
  country: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lawnbowl.app";

  return {
    subject: `${clubName} — free digital platform for your club`,
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
        Hi${contactName ? ` ${contactName}` : ""},
      </h2>
      <p style="color:#3D5A3E;font-size:16px;line-height:1.6;margin:0 0 20px">
        I noticed <strong>${clubName}</strong> in ${country} and wanted to reach out.
        We have built a free platform specifically for lawn bowling clubs, and I think it could be
        a great fit for your club.
      </p>

      <div style="background:#f0fdf4;border-radius:12px;padding:24px;margin-bottom:24px">
        <h3 style="color:#1B5E20;font-size:16px;margin:0 0 12px;font-weight:600">What clubs use it for</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:6px 0;color:#3D5A3E;font-size:14px">&#10003; Online club directory listing</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#3D5A3E;font-size:14px">&#10003; Player matchmaking &amp; partner finder</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#3D5A3E;font-size:14px">&#10003; Tournament brackets &amp; scoring</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#3D5A3E;font-size:14px">&#10003; QR code venue check-in</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#3D5A3E;font-size:14px">&#10003; Member communication &amp; events</td>
          </tr>
        </table>
      </div>

      <p style="color:#3D5A3E;font-size:15px;line-height:1.6;margin:0 0 24px">
        It is completely free for clubs. We would love to have <strong>${clubName}</strong>
        on the platform. Would you be open to a quick 15-minute demo?
      </p>

      <div style="text-align:center;margin-bottom:16px">
        <a href="${appUrl}/demo?club=${encodeURIComponent(clubName)}&country=${encodeURIComponent(country)}"
           style="display:inline-block;background:#1B5E20;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:16px">
          Schedule a Demo
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px;text-align:center;margin:0">
        Or reply to this email and we will find a time that works.
      </p>
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
