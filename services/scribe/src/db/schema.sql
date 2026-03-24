CREATE TABLE IF NOT EXISTS user_stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slack_message_id TEXT UNIQUE NOT NULL,
  channel_id TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  generated_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
