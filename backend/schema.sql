-- SiteBox D1 / SQLite Schema
-- Run: wrangler d1 execute sitebox --file=schema.sql

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_collapsible INTEGER DEFAULT 1,
  group_type TEXT NOT NULL,
  dashboard_type TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS websites (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  favicon_url TEXT DEFAULT '',
  last_access_time TEXT,
  order_index INTEGER DEFAULT 0,
  is_accessible INTEGER DEFAULT 1,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dockers (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  name TEXT,
  display_name TEXT,
  url TEXT,
  url_port INTEGER,
  description TEXT DEFAULT '',
  server TEXT,
  server_port INTEGER,
  favicon_url TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  website_info TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_websites_group_id ON websites(group_id);
CREATE INDEX IF NOT EXISTS idx_websites_url ON websites(url);
CREATE INDEX IF NOT EXISTS idx_dockers_group_id ON dockers(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_group_type ON groups(group_type);
