CREATE TABLE IF NOT EXISTS requests (
  request_id   TEXT PRIMARY KEY,
  timestamp    TEXT NOT NULL DEFAULT (datetime('now')),
  model_used   TEXT,
  tier         TEXT,
  task_type    TEXT,
  service      TEXT NOT NULL DEFAULT 'unknown',
  tokens_in    INTEGER NOT NULL DEFAULT 0,
  tokens_out   INTEGER NOT NULL DEFAULT 0,
  cost_usd     REAL,
  status       TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  duration_ms  INTEGER NOT NULL DEFAULT 0,
  metadata     TEXT
);

CREATE INDEX IF NOT EXISTS idx_requests_timestamp ON requests(timestamp);
CREATE INDEX IF NOT EXISTS idx_requests_service ON requests(service);
CREATE INDEX IF NOT EXISTS idx_requests_model ON requests(model_used);
