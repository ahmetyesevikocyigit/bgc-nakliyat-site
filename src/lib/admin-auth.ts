import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const adminCookieName = "bgc_admin_session";
const fallbackPassword = "admin123";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || fallbackPassword;
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || getAdminPassword();
}

function createSessionToken() {
  return createHmac("sha256", getSessionSecret()).update("bgc-admin-session").digest("hex");
}

function isEqual(value: string, expectedValue: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expectedValue);

  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}

export function isValidAdminPassword(password: string) {
  return isEqual(password, getAdminPassword());
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
