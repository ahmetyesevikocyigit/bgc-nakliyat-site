import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

type KvRow = {
  value_json: string;
};

type QuoteRequestRow = {
  id: string;
  created_at: string;
  fields_json: string;
  photo_urls_json: string;
};

let database: DatabaseSync | null = null;

export function getDatabasePath() {
  if (process.env.BGC_DB_PATH) {
    return process.env.BGC_DB_PATH;
  }

  return join(process.cwd(), ".data", "bgc.sqlite");
}

export function getDatabase() {
  if (database) {
    return database;
  }

  const databasePath = getDatabasePath();
  mkdirSync(dirname(databasePath), { recursive: true });
  database = new DatabaseSync(databasePath);
  ensureDatabaseSchema(database);

  return database;
}

export function closeDatabaseForTests() {
  if (database) {
    database.close();
    database = null;
  }
}

export function ensureDatabaseSchema(db = getDatabase()) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quote_requests (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      fields_json TEXT NOT NULL,
      photo_urls_json TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at
      ON quote_requests(created_at DESC);

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash
      ON admin_sessions(token_hash);

    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      window_start INTEGER NOT NULL,
      count INTEGER NOT NULL,
      blocked_until INTEGER
    );
  `);
}

export function readKvJson<T>(key: string): T | null {
  const row = getDatabase().prepare("SELECT value_json FROM kv_store WHERE key = ?").get(key) as
    | KvRow
    | undefined;

  return row ? (JSON.parse(row.value_json) as T) : null;
}

export function writeKvJson<T>(key: string, value: T) {
  getDatabase()
    .prepare(
      `
        INSERT INTO kv_store (key, value_json, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value_json = excluded.value_json,
          updated_at = excluded.updated_at
      `,
    )
    .run(key, JSON.stringify(value), new Date().toISOString());
}

export function readQuoteRequestRows() {
  return getDatabase()
    .prepare(
      `
        SELECT id, created_at, fields_json, photo_urls_json
        FROM quote_requests
        ORDER BY created_at DESC
        LIMIT 500
      `,
    )
    .all() as QuoteRequestRow[];
}

export function insertQuoteRequestRow(input: {
  id: string;
  createdAt: string;
  fields: Record<string, string>;
  photoUrls: string[];
}) {
  getDatabase()
    .prepare(
      `
        INSERT INTO quote_requests (id, created_at, fields_json, photo_urls_json)
        VALUES (?, ?, ?, ?)
      `,
    )
    .run(input.id, input.createdAt, JSON.stringify(input.fields), JSON.stringify(input.photoUrls));
}

export function pruneQuoteRequests(limit = 500) {
  getDatabase()
    .prepare(
      `
        DELETE FROM quote_requests
        WHERE id NOT IN (
          SELECT id FROM quote_requests ORDER BY created_at DESC LIMIT ?
        )
      `,
    )
    .run(limit);
}

export function upsertQuoteRequestRow(input: {
  id: string;
  createdAt: string;
  fields: Record<string, string>;
  photoUrls: string[];
}) {
  getDatabase()
    .prepare(
      `
        INSERT INTO quote_requests (id, created_at, fields_json, photo_urls_json)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          created_at = excluded.created_at,
          fields_json = excluded.fields_json,
          photo_urls_json = excluded.photo_urls_json
      `,
    )
    .run(input.id, input.createdAt, JSON.stringify(input.fields), JSON.stringify(input.photoUrls));
}

export function runSqliteTransaction<T>(callback: () => T) {
  const db = getDatabase();
  db.exec("BEGIN IMMEDIATE");

  try {
    const result = callback();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
