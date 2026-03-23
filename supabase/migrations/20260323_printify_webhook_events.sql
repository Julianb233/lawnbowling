-- ═══════════════════════════════════════════════════════════════
-- printify_webhook_events — Persist every inbound Printify webhook
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS printify_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  carrier TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE printify_webhook_events ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (webhooks run as service role)
CREATE POLICY "Service role can manage webhook events" ON printify_webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- Users can view events for their own orders (join through shop_orders.player_id)
CREATE POLICY "Users can view own order events" ON printify_webhook_events
  FOR SELECT USING (
    order_id IN (
      SELECT fulfillment_id FROM shop_orders
      WHERE player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_printify_webhook_events_order_id ON printify_webhook_events(order_id);
CREATE INDEX IF NOT EXISTS idx_printify_webhook_events_event_type ON printify_webhook_events(event_type);

-- ═══════════════════════════════════════════════════════════════
-- Add missing columns to shop_orders for Printify fulfillment tracking
-- (printify_order_id, tracking_number, tracking_url)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS printify_order_id TEXT;
ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_orders_printify_order_id
  ON shop_orders(printify_order_id) WHERE printify_order_id IS NOT NULL;
