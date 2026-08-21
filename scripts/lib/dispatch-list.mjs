/**
 * Shared plumbing for the Dispatch list scripts.
 *
 * Google Sheets over plain fetch, with the service-account JWT signed by
 * node:crypto — no npm dependencies, so these run on a bare Node 18+ with
 * nothing installed.
 *
 * Used by scripts/dispatch-send.mjs and scripts/dispatch-unsent.mjs. The row
 * parsing lives here rather than in either script so the two can never drift
 * on what counts as a valid address or a usable name — a disagreement there
 * would mean the audit and the sender describe different lists.
 */

import { createSign } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";

/* ----------------------------------------------------------------- google */

export function serviceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is not set.\n\n" +
        "  1. Google Cloud console -> IAM -> Service Accounts -> create one\n" +
        "  2. Keys -> Add key -> JSON, and download it\n" +
        "  3. Enable the Google Sheets API for that project\n" +
        "  4. Share the spreadsheet with the account's client_email (Viewer is\n" +
        "     enough to read; Editor is needed to write status back)\n" +
        "  5. export GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/key.json",
    );
  }
  const text = existsSync(raw) ? readFileSync(raw, "utf8") : raw;
  let key;
  try {
    key = JSON.parse(text);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is neither valid JSON nor a path to a JSON file");
  }
  if (!key.client_email || !key.private_key) {
    throw new Error("service account JSON is missing client_email / private_key");
  }
  return key;
}

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export async function googleAccessToken(
  scope = "https://www.googleapis.com/auth/spreadsheets",
) {
  const key = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${b64url(signer.sign(key.private_key))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`google token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

/** Every tab in the spreadsheet, with its title and dimensions. */
export async function listTabs(sheetId, token) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties.title,sheets.properties`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 403) {
      throw new Error(
        `403 reading the spreadsheet. Share it with the service account's client_email.\n${body}`,
      );
    }
    throw new Error(`tab listing failed: ${res.status} ${body}`);
  }
  const json = await res.json();
  return {
    title: json.properties?.title ?? "(untitled)",
    tabs: (json.sheets ?? []).map((s) => ({
      title: s.properties.title,
      rows: s.properties.gridProperties?.rowCount ?? 0,
      cols: s.properties.gridProperties?.columnCount ?? 0,
    })),
  };
}

export async function readTab(sheetId, tab, token) {
  const range = encodeURIComponent(`${tab}!A1:Z100000`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`read of tab "${tab}" failed: ${res.status} ${await res.text()}`);
  return (await res.json()).values ?? [];
}

export async function batchUpdate(sheetId, token, data) {
  if (!data.length) return;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchUpdate`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ valueInputOption: "RAW", data }),
    },
  );
  if (!res.ok) throw new Error(`write failed: ${res.status} ${await res.text()}`);
}

/* ---------------------------------------------------------------- parsing */

export const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i;

export const colIndex = (letter) =>
  letter.toUpperCase().split("").reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;

// "mary" -> "Mary", "o'brien" -> "O'Brien". A name that already carries
// internal capitals ("McKinley", "DeSoto") is left exactly as typed.
export function titleCase(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/[a-z][A-Z]/.test(s)) return s;
  return s.toLowerCase().replace(/(^|[\s\-'’])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
}

// A given name we are willing to put after "Dear". Not an address, not an
// initial, not a slashed pair like "Shelley/suzanne" where there is no way
// to tell which of the two is reading.
export function usableFirstName(raw) {
  const s = titleCase(raw);
  if (!s) return null;
  if (s.includes("@") || s.includes("/")) return null;
  if (s.replace(/[^A-Za-z]/g, "").length < 2) return null;
  return s;
}

// Does this address plausibly belong to this person? Shared and spousal
// inboxes are common on an imported list — Robert Feld at jeffdashing@,
// Judith Bennett at normanbennett@ — and greeting those by the contact's
// first name reads like a scraped list to whoever actually opens it.
export function addressLooksPersonal(email, first, last) {
  const local = String(email).split("@")[0].toLowerCase().replace(/[^a-z]/g, "");
  const f = String(first ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const l = String(last ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (!local) return false;
  if (f.length >= 3 && local.includes(f)) return true;
  if (l.length >= 3 && local.includes(l)) return true;
  return false;
}

/**
 * Turn raw sheet rows into records, one per contact.
 *
 * `statusCol` is a column letter. Whatever sits there decides sendState:
 *   "SENT …"            -> sent
 *   "SKIPPED…" / other  -> failed
 *   empty               -> unsent, never attempted
 */
export function parseRows(rows, { statusCol = "C", cols = {} } = {}) {
  const C = { firstName: 0, email: 1, lastName: 5, ...cols };
  const statusIdx = colIndex(statusCol);

  return rows.slice(1).map((row, i) => {
    const rowNumber = i + 2; // 1-indexed, past the header row
    const rawFirst = row[C.firstName] ?? "";
    const rawLast = row[C.lastName] ?? "";
    let first = rawFirst;
    let email = String(row[C.email] ?? "").trim().toLowerCase();
    const status = String(row[statusIdx] ?? "").trim();

    // Column-shift recovery: a handful of rows were typed with the address in
    // the First Name cell and Email left blank, which is exactly why the
    // August send skipped them.
    let recovered = false;
    const firstTrimmed = String(first).trim();
    if (!email && firstTrimmed.includes("@") && EMAIL_RE.test(firstTrimmed)) {
      email = firstTrimmed.toLowerCase();
      first = "";
      recovered = true;
    }

    const firstName = usableFirstName(first);
    const lastName = titleCase(rawLast);

    let sendState;
    if (/^SENT\b/i.test(status)) sendState = "sent";
    else if (status) sendState = "failed";
    else sendState = "unsent";

    let mailable = null;
    if (!email) mailable = "no email address anywhere on the row";
    else if (!EMAIL_RE.test(email)) mailable = "address is malformed";

    return {
      rowNumber,
      rawFirst,
      rawLast,
      firstName,
      lastName,
      email,
      recovered,
      status,
      sendState,
      mailable, // null when the row can be mailed
      // For display only. Never echo a recovered address back as if it were
      // a name, and drop last names that are punctuation ("/", "I.") rather
      // than printing them.
      displayName:
        [
          firstName ?? (String(rawFirst).includes("@") ? "" : titleCase(rawFirst)),
          /[A-Za-z]{2,}/.test(lastName) ? lastName : "",
        ]
          .filter(Boolean)
          .join(" ")
          .trim() || "(no name)",
    };
  });
}

/** Case-insensitive dedupe, keeping the first occurrence. */
export function dedupeByEmail(records) {
  const seen = new Set();
  const unique = [];
  const dupes = [];
  for (const r of records) {
    if (!r.email) {
      unique.push(r);
      continue;
    }
    if (seen.has(r.email)) dupes.push(r);
    else {
      seen.add(r.email);
      unique.push(r);
    }
  }
  return { unique, dupes };
}

export function toCsv(rows, headers) {
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}
