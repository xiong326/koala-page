CREATE TABLE IF NOT EXISTS passkeys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  passkey_id INTEGER NOT NULL REFERENCES passkeys(id),
  role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  passkey_id INTEGER NOT NULL REFERENCES passkeys(id),
  passkey_name TEXT NOT NULL,
  action TEXT NOT NULL,
  koala_id TEXT NOT NULL,
  koala_name TEXT,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS koalas (
  id TEXT PRIMARY KEY,
  board TEXT NOT NULL,
  name TEXT NOT NULL,
  nicknames TEXT,
  birth_date TEXT,
  sex TEXT NOT NULL CHECK(sex IN ('male', 'female')),
  photo TEXT,
  mother TEXT,
  father TEXT,
  deceased INTEGER NOT NULL DEFAULT 0,
  date_of_death TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_koalas_board ON koalas(board);
