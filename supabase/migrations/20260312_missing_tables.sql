-- Create missing tables referenced in codebase but absent from migrations
-- Addresses gap analysis issues C-008 (partial), plus shop_orders, subscriptions, staff_invitations

-- ═══════════════════════════════════════════════════════════════
-- 1. shop_orders — Stripe checkout tracking
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, fulfilled, cancelled
  items JSONB NOT NULL DEFAULT '[]',
  total_amount INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  shipping_address JSONB,
  fulfillment_provider TEXT, -- 'printify' etc.
  fulfillment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON shop_orders
  FOR SELECT USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage orders" ON shop_orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_shop_orders_player ON shop_orders(player_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_stripe_session ON shop_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);

-- ═══════════════════════════════════════════════════════════════
-- 2. subscriptions — Stripe subscription tracking
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, past_due, cancelled, trialing
  plan TEXT NOT NULL, -- 'free', 'pro', 'club_admin'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_subscriptions_player ON subscriptions(player_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ═══════════════════════════════════════════════════════════════
-- 3. staff_invitations — Club staff invite management
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS staff_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- member, manager, admin
  invited_by UUID REFERENCES players(id),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club admins can manage invitations" ON staff_invitations
  FOR ALL USING (
    invited_by IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role can manage all invitations" ON staff_invitations
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_staff_invitations_club ON staff_invitations(club_id);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_email ON staff_invitations(email);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_token ON staff_invitations(token);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_status ON staff_invitations(status);
