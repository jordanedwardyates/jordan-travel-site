/**
 * Shared Edge/Node verifier for the internal advisor desk.
 * Never accept a password from the URL: URLs are logged and shared.
 */
export async function isAuthorizedAdvisor(authorization: string | null): Promise<boolean> {
  const secret = process.env.INTERNAL_PREVIEW_TOKEN;
  // Require a strong secret; fail closed on misconfiguration.
  if (!secret || secret.length < 32 || !authorization || authorization.length > 8192) {
    return false;
  }

  const match = /^Basic\s+([A-Za-z0-9+/=]+)$/i.exec(authorization);
  if (!match) return false;

  let credentials: string;
  try {
    credentials = atob(match[1]);
  } catch {
    return false;
  }

  const prefix = "advisor:";
  if (!credentials.startsWith(prefix)) return false;

  const candidate = credentials.slice(prefix.length);
  const encoder = new TextEncoder();
  const [candidateHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(candidate)),
    crypto.subtle.digest("SHA-256", encoder.encode(secret)),
  ]);
  const actual = new Uint8Array(candidateHash);
  const expected = new Uint8Array(expectedHash);
  let difference = 0;
  for (let i = 0; i < actual.length; i += 1) {
    difference |= actual[i] ^ expected[i];
  }
  return difference === 0;
}
