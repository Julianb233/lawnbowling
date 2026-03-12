-- ============================================================
-- MONITORING & OBSERVABILITY SETUP
-- Enables pg_stat_statements and creates monitoring helper views
-- Linear: AI-2450
-- ============================================================

-- 1. Enable pg_stat_statements for query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 2. Monitoring view: slow queries (>500ms) from pg_stat_statements
CREATE OR REPLACE VIEW public.monitor_slow_queries AS
SELECT
  queryid,
  LEFT(query, 200) AS query_preview,
  calls,
  ROUND((total_exec_time / 1000)::numeric, 2) AS total_exec_seconds,
  ROUND((mean_exec_time)::numeric, 2) AS mean_exec_ms,
  ROUND((max_exec_time)::numeric, 2) AS max_exec_ms,
  ROUND((min_exec_time)::numeric, 2) AS min_exec_ms,
  rows
FROM pg_stat_statements
WHERE mean_exec_time > 500
ORDER BY mean_exec_time DESC;

-- 3. Monitoring view: database connection stats
CREATE OR REPLACE VIEW public.monitor_connections AS
SELECT
  datname,
  numbackends AS active_connections,
  (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_connections,
  ROUND(
    numbackends::numeric /
    NULLIF((SELECT setting::int FROM pg_settings WHERE name = 'max_connections'), 0) * 100,
    1
  ) AS usage_pct
FROM pg_stat_database
WHERE datname = current_database();

-- 4. Monitoring view: table sizes and bloat
CREATE OR REPLACE VIEW public.monitor_table_sizes AS
SELECT
  schemaname,
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || relname)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || relname)) AS table_size,
  pg_size_pretty(pg_indexes_size(schemaname || '.' || relname)) AS index_size,
  n_live_tup AS estimated_rows,
  n_dead_tup AS dead_rows,
  CASE
    WHEN n_live_tup > 0 THEN ROUND(n_dead_tup::numeric / n_live_tup * 100, 1)
    ELSE 0
  END AS dead_row_pct
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname || '.' || relname) DESC;

-- 5. Monitoring view: index usage stats
CREATE OR REPLACE VIEW public.monitor_index_usage AS
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan AS scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- 6. Monitoring view: RLS policy check (tables without RLS)
CREATE OR REPLACE VIEW public.monitor_rls_status AS
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY rls_enabled ASC, tablename;

-- 7. Audit log table for webhook alerts
CREATE TABLE IF NOT EXISTS public.monitoring_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES players(id),
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage alerts
CREATE POLICY "Admins can view alerts" ON monitoring_alerts FOR SELECT USING (
  EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update alerts" ON monitoring_alerts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM players WHERE user_id = auth.uid() AND role = 'admin')
);
-- Service role can insert (from webhook endpoint)
CREATE POLICY "Service role can insert alerts" ON monitoring_alerts FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_monitoring_alerts_type ON monitoring_alerts(alert_type);
CREATE INDEX idx_monitoring_alerts_created ON monitoring_alerts(created_at DESC);
CREATE INDEX idx_monitoring_alerts_unacked ON monitoring_alerts(acknowledged) WHERE acknowledged = false;
