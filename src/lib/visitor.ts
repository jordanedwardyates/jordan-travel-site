const VISITOR_ID_COOKIE = "visitor_id";
const VISITOR_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export function generateVisitorId(): string {
  // UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getVisitorIdFromCookie(
  cookieHeader: string | null
): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${VISITOR_ID_COOKIE}=([^;]+)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setVisitorIdCookie(visitorId: string): string {
  const maxAge = VISITOR_COOKIE_MAX_AGE;
  return `${VISITOR_ID_COOKIE}=${encodeURIComponent(visitorId)}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Lax`;
}
