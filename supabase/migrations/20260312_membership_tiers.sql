-- Membership tier columns on players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS membership_tier TEXT CHECK (membership_tier IN ('free', 'monthly', 'annual')) DEFAULT 'free';
ALTER TABLE players ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ;
ALTER TABLE players ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
