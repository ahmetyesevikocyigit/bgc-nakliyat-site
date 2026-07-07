import { createHmac, randomBytes, scryptSync } from "node:crypto";
import { mkdirSync } from "node:fs";
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
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT
    );
  `);
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function generatePassword() {
  return createHmac("sha256", randomBytes(32)).update(String(Date.now())).digest("base64url").slice(0, 24);
}

const password = process.env.ADMIN_PASSWORD || process.argv[2] || generatePassword();

if (password.trim().length < 12) {
  throw new Error("Admin şifresi en az 12 karakter olmalı.");
}

const dbPath = getDatabasePath();
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
ensureSchema(db);

const now = new Date().toISOString();
db.exec("BEGIN IMMEDIATE");
try {
  db.prepare(`
    INSERT INTO kv_store (key, value_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = excluded.updated_at
  `).run(
    "admin-settings",
    JSON.stringify({
      passwordHash: hashPassword(password.trim()),
      updatedAt: now,
    }),
    now,
  );
  db.prepare("UPDATE admin_sessions SET revoked_at = ? WHERE revoked_at IS NULL").run(now);
  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally {
  db.close();
}

console.log("Admin şifresi resetlendi.");

if (!process.env.ADMIN_PASSWORD && !process.argv[2]) {
  console.log(`Yeni admin şifresi: ${password}`);
}
