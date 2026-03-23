export function orderDeliveredEmail(
  customerName: string,
  orderId: string,
) {
  return {
    subject: `Your Order #${orderId} Has Been Delivered!`,
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
      <h2 style="color:#fafafa;font-size:22px;margin:0 0 16px">Order Delivered!</h2>
      <p style="color:#a1a1aa;font-size:16px;line-height:1.6;margin:0 0 20px">
        Hey ${customerName}, your order <strong style="color:#fafafa">#${orderId}</strong> has been delivered. We hope you love your new gear!
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://lawnbowl.app"}/shop/orders"
         style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:16px">
        View Your Orders
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
