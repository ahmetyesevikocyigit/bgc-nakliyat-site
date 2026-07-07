import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

function getDatabasePath() {
  if (process.env.BGC_DB_PATH) {
    return process.env.BGC_DB_PATH;
  }

  return join(process.cwd(), ".data", "bgc.sqlite");
}

function ensureSchema(db) {
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

function readJsonIfExists(filePath, fallback) {
  if (!existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeKv(db, key, value) {
  db.prepare(`
    INSERT INTO kv_store (key, value_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = excluded.updated_at
  `).run(key, JSON.stringify(value), new Date().toISOString());
}

function migrateQuoteRequests(db, requests) {
  const statement = db.prepare(`
    INSERT INTO quote_requests (id, created_at, fields_json, photo_urls_json)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      created_at = excluded.created_at,
      fields_json = excluded.fields_json,
      photo_urls_json = excluded.photo_urls_json
  `);

  for (const request of Array.isArray(requests) ? requests : []) {
    if (!request || typeof request !== "object" || !request.id || !request.createdAt) {
      continue;
    }

    const {
      id,
      createdAt,
      photoUrls = [],
      fullName = "",
      email = "",
      phone = "",
      service = "",
      fromAddress = "",
      toAddress = "",
      fromFloor = "",
      toFloor = "",
      roomCount = "",
      moveDate = "",
      elevatorNeed = "",
      message = "",
    } = request;

    statement.run(
      String(id),
      String(createdAt),
      JSON.stringify({
        fullName,
        email,
        phone,
        service,
        fromAddress,
        toAddress,
        fromFloor,
        toFloor,
        roomCount,
        moveDate,
        elevatorNeed,
        message,
      }),
      JSON.stringify(Array.isArray(photoUrls) ? photoUrls : []),
    );
  }
}

const dbPath = getDatabasePath();
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
ensureSchema(db);

const dataDirectory = join(process.cwd(), "src", "data");
const editableContent = readJsonIfExists(join(dataDirectory, "editable-content.json"), null);
const mediaLibrary = readJsonIfExists(join(dataDirectory, "media-library.json"), null);
const adminSettings = readJsonIfExists(join(dataDirectory, "admin-settings.json"), null);
const quoteRequests = readJsonIfExists(join(dataDirectory, "quote-requests.json"), []);

db.exec("BEGIN IMMEDIATE");
try {
  if (editableContent) writeKv(db, "editable-content", editableContent);
  if (mediaLibrary) writeKv(db, "media-library", mediaLibrary);
  if (adminSettings) writeKv(db, "admin-settings", adminSettings);
  migrateQuoteRequests(db, quoteRequests);
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}

console.log(`SQLite migration tamamlandı: ${dbPath}`);
