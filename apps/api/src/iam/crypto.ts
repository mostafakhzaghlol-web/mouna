import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

/** Secret mixed into stored hashes, so a database copy alone cannot be used to check codes. */
function pepper(): string {
  return process.env.AUTH_PEPPER ?? "dev-only-pepper-change-me";
}

export function hashSecret(value: string): string {
  return createHmac("sha256", pepper()).update(value).digest("hex");
}

export function sameHash(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Six-digit one-time code. */
export function newCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** Opaque session token for the cookie; only its hash is stored. */
export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}
