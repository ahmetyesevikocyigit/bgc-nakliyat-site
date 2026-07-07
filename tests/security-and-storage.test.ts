import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const tempDirectory = mkdtempSync(join(tmpdir(), "bgc-tests-"));
process.env.BGC_DB_PATH = join(tempDirectory, "bgc.sqlite");
process.env.ADMIN_SESSION_SECRET = "test-secret-with-enough-length";

test.after(() => {
  rmSync(tempDirectory, { recursive: true, force: true });
});

test("admin password hashes verify correct password only", async () => {
  const { hashAdminPassword, isValidPasswordHash } = await import("../src/lib/admin-auth");
  const hash = hashAdminPassword("CokGucluSifre123!");

  assert.equal(isValidPasswordHash("CokGucluSifre123!", hash), true);
  assert.equal(isValidPasswordHash("yanlis-sifre", hash), false);
});

test("admin sessions can be created, validated and revoked", async () => {
  const { closeDatabaseForTests } = await import("../src/lib/sqlite-store");
  closeDatabaseForTests();

  const { createAdminSessionToken, isAdminSessionTokenValid, revokeAdminSessionToken } = await import("../src/lib/admin-auth");
  const token = createAdminSessionToken();

  assert.equal(isAdminSessionTokenValid(token), true);
  revokeAdminSessionToken(token);
  assert.equal(isAdminSessionTokenValid(token), false);
});

test("rate limit blocks after configured threshold", async () => {
  const { checkRateLimit, clearRateLimit } = await import("../src/lib/rate-limit");
  const key = "test-rate-limit";
  clearRateLimit(key);

  assert.equal(checkRateLimit({ key, limit: 2, windowMs: 60_000 }).allowed, true);
  assert.equal(checkRateLimit({ key, limit: 2, windowMs: 60_000 }).allowed, true);
  assert.equal(checkRateLimit({ key, limit: 2, windowMs: 60_000 }).allowed, false);
});

test("image validation rejects unsupported MIME and oversized files", async () => {
  const { getImageUploadError, maxQuoteImageUploadSize } = await import("../src/lib/upload-validation");
  const invalidType = new File([new Uint8Array([1, 2, 3])], "bad.txt", { type: "text/plain" });
  const tooLarge = new File([new Uint8Array(maxQuoteImageUploadSize + 1)], "large.jpg", { type: "image/jpeg" });

  assert.match(getImageUploadError(invalidType, maxQuoteImageUploadSize), /desteklenmiyor/);
  assert.match(getImageUploadError(tooLarge, maxQuoteImageUploadSize), /çok büyük/);
});
