export function orderShippedEmail(
  customerName: string,
  orderId: string,
  carrier: string | null,
  trackingNumber: string | null,
  trackingUrl: string | null,
) {
  const trackingBlock = trackingNumber
    ? `
        <div style="background:#27272a;border-radius:12px;padding:20px;margin:0 0 24px">
          <p style="color:#71717a;font-size:12px;margin:0 0 8px">Tracking Info</p>
          <p style="color:#fafafa;font-size:16px;font-weight:600;margin:0 0 4px">${carrier ?? "Carrier"}</p>
          <p style="color:#a1a1aa;font-size:14px;margin:0">${trackingNumber}</p>
        </div>
        ${
          trackingUrl
            ? `<a href="${trackingUrl}"
               style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:16px;margin-bottom:16px">
              Track Package
            </a>`
            : ""
        }`
    : "";

  return {
    subject: `Your Order #${orderId} Has Shipped!`,
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
      <h2 style="color:#fafafa;font-size:22px;margin:0 0 16px">Your Order Has Shipped!</h2>
      <p style="color:#a1a1aa;font-size:16px;line-height:1.6;margin:0 0 20px">
        Hey ${customerName}, great news — your order <strong style="color:#fafafa">#${orderId}</strong> is on its way!
      </p>
      ${trackingBlock}
    </div>
    <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px">
      Lawnbowling - Find your perfect match on the court
    </p>
  </div>
</body>
</html>`,
  };
}
