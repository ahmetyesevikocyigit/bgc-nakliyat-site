import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { readStoreJson, writeStoreJson } from "@/lib/persistent-store";
import { getDatabase } from "@/lib/sqlite-store";

const adminCookieName = "bgc_admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 8;

type AdminSettings = {
  passwordHash?: string;
  updatedAt?: string;
};

export function hashAdminPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET production ortamında zorunludur.");
  }

  return "dev-only-bgc-admin-session-secret";
}

function hashSessionToken(token: string) {
  return createHmac("sha256", getSessionSecret()).update(token).digest("hex");
}

function isEqual(value: string, expectedValue: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expectedValue);

  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

async function getAdminSettings() {
  return readStoreJson<AdminSettings>("admin-settings", {});
}

export function isValidPasswordHash(password: string, passwordHash: string) {
  const [algorithm, salt, expectedHash] = passwordHash.split(":");

  if (algorithm !== "scrypt" || !salt || !expectedHash) {
    return false;
  }

  const hash = scryptSync(password, salt, 64).toString("hex");

  return isEqual(hash, expectedHash);
}

export async function isValidAdminPasswordAsync(password: string) {
  const settings = await getAdminSettings();

  if (settings.passwordHash) {
    return isValidPasswordHash(password, settings.passwordHash);
  }

  return false;
}

export async function updateAdminPassword(currentPassword: string, newPassword: string) {
  if (!(await isValidAdminPasswordAsync(currentPassword))) {
    return { ok: false, reason: "current" as const };
  }

  const cleanPassword = newPassword.trim();

  if (cleanPassword.length < 8) {
    return { ok: false, reason: "length" as const };
  }

  await writeStoreJson<AdminSettings>("admin-settings", {
    passwordHash: hashAdminPassword(cleanPassword),
    updatedAt: new Date().toISOString(),
  });

  return { ok: true as const };
}

export function createAdminSessionToken() {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionMaxAgeSeconds * 1000);

  getDatabase()
    .prepare(
      `
        INSERT INTO admin_sessions (id, token_hash, created_at, expires_at, revoked_at)
        VALUES (?, ?, ?, ?, NULL)
      `,
    )
    .run(randomUUID(), hashSessionToken(token), now.toISOString(), expiresAt.toISOString());

  return token;
}

export function revokeAdminSessionToken(token: string) {
  getDatabase()
    .prepare(
      `
        UPDATE admin_sessions
        SET revoked_at = ?
        WHERE token_hash = ?
      `,
    )
    .run(new Date().toISOString(), hashSessionToken(token));
}

export function isAdminSessionTokenValid(token: string) {
  const tokenHash = hashSessionToken(token);
  const row = getDatabase()
    .prepare(
      `
        SELECT token_hash
        FROM admin_sessions
        WHERE token_hash = ?
          AND revoked_at IS NULL
          AND expires_at > ?
        LIMIT 1
      `,
    )
    .get(tokenHash, new Date().toISOString()) as { token_hash: string } | undefined;

  return Boolean(row && isEqual(row.token_hash, tokenHash));
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  const token = createAdminSessionToken();

  cookieStore.set(adminCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName)?.value;

  if (token) {
    revokeAdminSessionToken(token);
  }

  cookieStore.delete(adminCookieName);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName)?.value;

  if (!token) {
    return false;
  }

  return isAdminSessionTokenValid(token);
}
