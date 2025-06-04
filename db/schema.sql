DROP TABLE IF EXISTS todos;

CREATE TABLE todos (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0, -- 0 for false, 1 for true
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
