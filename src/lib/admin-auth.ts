import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { readStoreJson, writeStoreJson } from "@/lib/persistent-store";

const adminCookieName = "bgc_admin_session";
const fallbackPassword = "bgcnakliyat1*";

type AdminSettings = {
  passwordHash?: string;
  updatedAt?: string;
};

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "bgc-admin-session-secret";
}

function createSessionToken() {
  return createHmac("sha256", getSessionSecret()).update("bgc-admin-session").digest("hex");
}

function isEqual(value: string, expectedValue: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expectedValue);

  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

async function getAdminSettings() {
  return readStoreJson<AdminSettings>("admin-settings", {});
}

function isValidPasswordHash(password: string, passwordHash: string) {
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

  return isEqual(password, fallbackPassword);
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
    passwordHash: hashPassword(cleanPassword),
    updatedAt: new Date().toISOString(),
  });

  return { ok: true as const };
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(adminCookieName, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookieName);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName)?.value;

  return Boolean(token && isEqual(token, createSessionToken()));
}
