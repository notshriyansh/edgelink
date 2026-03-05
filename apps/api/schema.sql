CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  expires_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_short_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_user_id ON links(user_id);


CREATE TABLE IF NOT EXISTS clicks (
  id TEXT PRIMARY KEY,
  link_id TEXT NOT NULL,
  country TEXT,
  device TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_link_id ON clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON clicks(created_at);