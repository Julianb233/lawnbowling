-- Enable pg_net extension for HTTP requests from database triggers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Webhook trigger function that sends HTTP POST to the app
CREATE OR REPLACE FUNCTION notify_app_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payload JSONB;
  webhook_url TEXT := 'https://www.lawnbowling.app/api/webhooks/supabase';
BEGIN
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END,
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    'timestamp', now()
  );

  PERFORM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Supabase-Webhook-Secret', current_setting('app.webhook_secret', true)
    ),
    body := payload
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply webhooks to key tables

-- New tournament created → notify club members
CREATE TRIGGER trg_webhook_tournaments
  AFTER INSERT ON tournaments
  FOR EACH ROW EXECUTE FUNCTION notify_app_webhook();

-- Player checks in → notify friends
CREATE TRIGGER trg_webhook_checkins
  AFTER INSERT ON bowls_checkins
  FOR EACH ROW EXECUTE FUNCTION notify_app_webhook();

-- Match completed → notify players with results
CREATE TRIGGER trg_webhook_matches
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION notify_app_webhook();

-- New club membership → notify club admins
CREATE TRIGGER trg_webhook_memberships
  AFTER INSERT ON club_memberships
  FOR EACH ROW EXECUTE FUNCTION notify_app_webhook();
