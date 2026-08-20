import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed unsubscribe links.
 *
 * The address travels in the URL so the link works from a mail client with
 * no session, no cookie and no login. That means the URL alone is authority
 * to suppress an address — so it carries an HMAC, or anyone could unsubscribe
 * anyone by editing a query string.
 *
 * Server-only: importing this into a Client Component will fail the build,
 * which is the intent. UNSUBSCRIBE_SECRET must never reach the browser.
 */

function secret(): string {
  const s = process.env.UNSUBSCRIBE_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "UNSUBSCRIBE_SECRET is missing or too short (want 32+ random chars, e.g. `openssl rand -hex 32`)"
    );
  }
  return s;
}

/** Lowercased + trimmed, so the signature matches however the address is cased. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function signEmail(email: string): string {
  return createHmac("sha256", secret())
    .update(normalizeEmail(email))
    .digest("base64url");
}

export function verifyEmail(email: string, token: string): boolean {
  if (!email || !token) return false;
  let expected: string;
  try {
    expected = signEmail(email);
  } catch {
    return false;
  }
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  // Length check first: timingSafeEqual throws on a length mismatch.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** The URL that goes in both the footer link and the List-Unsubscribe header. */
export function unsubscribeUrl(email: string, origin: string): string {
  const e = normalizeEmail(email);
  return `${origin}/unsubscribe?e=${encodeURIComponent(e)}&t=${signEmail(e)}`;
}
