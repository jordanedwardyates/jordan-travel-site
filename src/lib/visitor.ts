import "server-only";

import { cookies } from "next/headers";

/**
 * Opaque per-browser visitor id, stored in an httpOnly cookie. Anonymous by
 * design — it carries no PII and only becomes linked to a person if they
 * submit a form (see identifyVisitor). Not a tracking cookie across sites;
 * strictly first-party analytics for lead intelligence.
 */
export const VISITOR_COOKIE = "bonv_vid";
const ONE_YEAR = 60 * 60 * 24 * 365;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Read the current visitor id from cookies, or null if unset/malformed. */
export async function readVisitorId(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(VISITOR_COOKIE)?.value;
  return value && UUID_RE.test(value) ? value : null;
}

/**
 * Read the visitor id, minting and persisting a fresh one if absent. Safe to
 * call from route handlers and server actions (both may set cookies).
 */
export async function getOrCreateVisitorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing && UUID_RE.test(existing)) return existing;

  const id = crypto.randomUUID();
  store.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return id;
}
