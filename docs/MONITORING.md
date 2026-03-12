# Supabase Monitoring & Observability

Dashboard: https://supabase.com/dashboard/project/fcwlrvjnmzoszjwmbyfl

## Log Explorer Saved Queries

Navigate to **Supabase Dashboard > Logs > Explorer** and create these saved queries:

### 1. Auth Failures

```sql
SELECT
  timestamp,
  event_message,
  metadata ->> 'path' AS path,
  metadata ->> 'status' AS status,
  metadata ->> 'method' AS method
FROM auth.logs
WHERE
  (metadata ->> 'status')::int >= 400
  AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC
LIMIT 100;
```

### 2. RLS Denials

```sql
SELECT
  timestamp,
  event_message,
  metadata ->> 'error' AS error_detail
FROM postgres.logs
WHERE
  event_message ILIKE '%permission denied%'
  OR event_message ILIKE '%row-level security%'
  OR event_message ILIKE '%new row violates row-level%'
ORDER BY timestamp DESC
LIMIT 100;
```

### 3. Slow Queries (>500ms)

```sql
SELECT
  timestamp,
  event_message,
  metadata ->> 'duration_ms' AS duration_ms,
  metadata ->> 'query' AS query
FROM postgres.logs
WHERE
  (metadata ->> 'duration_ms')::float > 500
  AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY (metadata ->> 'duration_ms')::float DESC
LIMIT 50;
```

### 4. Function Errors

```sql
SELECT
  timestamp,
  event_message,
  metadata ->> 'path' AS path,
  metadata ->> 'status' AS status,
  metadata ->> 'error' AS error
FROM edge.logs
WHERE
  (metadata ->> 'status')::int >= 500
  AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC
LIMIT 100;
```

> **Note:** If not using Edge Functions, this query will return no results. Monitor `postgres.logs` for database function errors instead:
>
> ```sql
> SELECT timestamp, event_message
> FROM postgres.logs
> WHERE event_message ILIKE '%error%function%'
>    OR event_message ILIKE '%ERROR%'
> ORDER BY timestamp DESC
> LIMIT 100;
> ```

## Database Extensions

### pg_stat_statements

Enabled via migration `20260312_monitoring_setup.sql`. Provides query-level performance metrics.

Query the monitoring views:

```sql
-- Top slow queries by mean execution time
SELECT * FROM public.monitor_slow_queries LIMIT 20;

-- Current connection pool usage
SELECT * FROM public.monitor_connections;

-- Table sizes and dead row bloat
SELECT * FROM public.monitor_table_sizes;

-- Index usage (find unused indexes)
SELECT * FROM public.monitor_index_usage WHERE scans = 0;

-- RLS status for all public tables
SELECT * FROM public.monitor_rls_status;
```

## Webhook Alerts

### Endpoint

```
POST /api/monitoring/webhook
```

**Authentication:** Bearer token via `MONITORING_WEBHOOK_SECRET` env var.

**Payload:**

```json
{
  "alert_type": "auth_error_spike",
  "severity": "critical",
  "message": "Auth error rate exceeded 50 errors/min",
  "metadata": { "error_count": 62, "window_minutes": 1 }
}
```

### Supported Alert Types

| Alert Type | Description | Suggested Threshold |
|---|---|---|
| `auth_error_spike` | Auth error rate exceeds normal levels | >50 errors/min |
| `connection_pool_saturation` | DB connections near max capacity | >80% of max_connections |
| `storage_quota_warning` | Storage approaching quota limit | >80% of quota |

### Configuring Supabase Webhooks

1. Navigate to **Dashboard > Database > Webhooks**
2. Create a webhook pointing to your deployment URL:
   - **URL:** `https://lawnbowl.app/api/monitoring/webhook`
   - **Headers:** `Authorization: Bearer <your-webhook-secret>`
3. For database-triggered alerts, configure triggers on the monitoring views
4. For external alerting, use a cron service (e.g., pg_cron) to periodically check thresholds and call the webhook

### Alert Storage

Alerts are stored in the `monitoring_alerts` table, visible to admin users. Fields:

- `alert_type` — category of alert
- `severity` — info, warning, or critical
- `message` — human-readable description
- `metadata` — additional JSON context
- `acknowledged` — whether an admin has acknowledged
- `acknowledged_by` / `acknowledged_at` — who and when

## Realtime Monitoring

Navigate to **Dashboard > Realtime > Inspector** to verify subscription health.

Tables with Realtime enabled:
- `players`, `partner_requests`, `matches`, `courts`
- `team_messages`, `teams`, `player_stats`
- `activity_feed`, `scheduled_games`, `game_rsvps`
- `tournaments`, `tournament_participants`, `tournament_matches`

Check for:
- Active connections count
- Message throughput
- Error rates on subscriptions

## Edge Functions

This project does not currently use Supabase Edge Functions. The `supabase/functions/` directory does not exist. If Edge Functions are added in the future:

1. Enable log streaming in **Dashboard > Edge Functions > Logs**
2. Add a Log Explorer saved query for Edge Function errors (template provided above)

## External Observability

- **Sentry** is configured for client-side error tracking (`sentry.client.config.ts`)
- **Structured logging** uses `console.warn` / `console.error` for server-side alerts
- Monitoring alerts are logged to console with `[ALERT]` prefix for log aggregation
