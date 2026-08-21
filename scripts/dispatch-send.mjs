#!/usr/bin/env node
/**
 * Dispatch sender — Google Sheets list in, Resend out.
 *
 *   node scripts/dispatch-send.mjs --audit
 *   node scripts/dispatch-send.mjs --dry-run --limit 3
 *   node scripts/dispatch-send.mjs --send
 *
 * No npm dependencies. Talks to both APIs over plain fetch and signs the
 * Google service-account JWT with node:crypto, so it runs on a bare Node 18+
 * with nothing installed. (This repo has no node_modules checked out; adding
 * `googleapis` and `resend` just to read one sheet and post one array is not
 * worth the install.)
 *
 * On the ESP choice — see docs/EMAIL_DELIVERABILITY.md for the full argument.
 * Short version: at ~330 recipients the raw inbox-placement difference between
 * a good ESP and an already-authenticated Workspace domain is small. Google's
 * and Yahoo's bulk-sender mandates bind at 5,000 messages/day, well above this
 * list. What an ESP actually buys here is a bounce and complaint feed, a
 * compliant one-click unsubscribe, and click events posting to
 * /api/webhooks/resend — which is what closes the email -> click -> quote ->
 * booking loop the campaigns tables already model.
 *
 * The one genuinely bad option is sending from a domain the recipients do not
 * recognise. DISPATCH_FROM must be a verified domain that reads as Jordan.
 *
 * Environment:
 *   GOOGLE_SERVICE_ACCOUNT_JSON  service-account key, raw JSON or a file path
 *   DISPATCH_SHEET_ID            spreadsheet id
 *   RESEND_API_KEY               only needed for --send
 *   DISPATCH_FROM                e.g. "Jordan Yates <jordan@bonvtravelcompany.com>"
 *   DISPATCH_REPLY_TO            optional, defaults to DISPATCH_FROM
 *
 * Share the sheet with the service account's client_email as an Editor, or
 * the status write-back will 403.
 */

import { createHmac } from "node:crypto";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  googleAccessToken,
  readTab,
  batchUpdate,
  parseRows,
  colIndex,
  addressLooksPersonal,
} from "./lib/dispatch-list.mjs";

/* ------------------------------------------------------------------ config */

const SHEET_ID = process.env.DISPATCH_SHEET_ID ?? "1Fn0Vx6AUSYiuWD14zSwqCp4Ew30Qi-F9T37WcBNcs3w";
const TAB = process.env.DISPATCH_SHEET_TAB ?? "Sheet1";

// Sheet layout, 0-indexed against the row array.
const COL = { firstName: 0, email: 1, legacyStatus: 2, lastName: 5 };

// Where this campaign writes its own result, so the legacy column C history
// from the August send stays intact.
const STATUS_COLUMN_LETTER = process.env.DISPATCH_STATUS_COL ?? "D";

const CAMPAIGN = {
  slug: "aegean-and-the-atlantic",
  templateFile: "emails/dispatch-aegean-and-the-atlantic.html",
  subject: "The Aegean & the Atlantic",
  preheader:
    "Seven nights out of Istanbul, and two Regent voyages where the airfare, the excursions and the wine are already in the fare.",
};

const SITE_ORIGIN = process.env.DISPATCH_SITE_ORIGIN ?? "https://www.bonvtravelcompany.com";

// Must stay byte-identical to signEmail() in src/lib/unsubscribe-token.ts, or
// every link this sender mints will be rejected by the site as tampered with.
function unsubscribeUrl(email) {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "UNSUBSCRIBE_SECRET is missing or too short. It must match the value deployed to the site, " +
        "or the links in this send will not work. Generate with `openssl rand -hex 32`.",
    );
  }
  const e = email.trim().toLowerCase();
  const sig = createHmac("sha256", secret).update(e).digest("base64url");
  return `${SITE_ORIGIN}/unsubscribe?e=${encodeURIComponent(e)}&t=${sig}&c=${CAMPAIGN.slug}`;
}

const RESEND_BATCH_MAX = 100; // hard API limit
const PAUSE_BETWEEN_BATCHES_MS = 1200;

/* -------------------------------------------------------------------- args */

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d = null) => {
  const hit = argv.find((a) => a.startsWith(`${f}=`));
  if (hit) return hit.slice(f.length + 1);
  const i = argv.indexOf(f);
  return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const MODE = has("--send")
  ? "send"
  : has("--fix-rows")
    ? "fix-rows"
    : has("--dry-run")
      ? "dry-run"
      : "audit";
const LIMIT = Number(val("--limit", "0")) || 0;
const ONLY = val("--only", null); // send to one address, for a seed test

/* ------------------------------------------------------------ sheets reads */

async function readSheet() {
  const token = await googleAccessToken();
  return { token, rows: await readTab(SHEET_ID, TAB, token) };
}

async function writeStatuses(token, updates) {
  await batchUpdate(
    SHEET_ID,
    token,
    updates.map((u) => ({
      range: `${TAB}!${STATUS_COLUMN_LETTER}${u.rowNumber}`,
      values: [[u.value]],
    })),
  );
}

/* ------------------------------------------------- cleaning + merge fields */

function buildContacts(rows) {
  const seen = new Set();

  return parseRows(rows, { statusCol: STATUS_COLUMN_LETTER, cols: COL }).map((r) => {
    const rec = { ...r, skip: null, warn: [] };

    if (r.sendState === "sent") rec.skip = "already sent this campaign";
    else if (r.mailable) rec.skip = r.mailable;
    else if (seen.has(r.email)) rec.skip = "duplicate address";
    if (!rec.skip) seen.add(r.email);

    if (r.recovered) rec.warn.push("address recovered from the first-name column");
    if (!r.firstName) rec.warn.push("no usable first name — neutral salutation");
    else if (r.email && !addressLooksPersonal(r.email, r.firstName, r.lastName)) {
      rec.warn.push("address may be shared/spousal — neutral salutation");
    }

    const personal = r.firstName && addressLooksPersonal(r.email, r.firstName, r.lastName);
    rec.merge = {
      first_name: r.firstName ?? "",
      last_name: r.lastName ?? "",
      email: r.email,
      greeting: personal ? `Dear ${r.firstName},` : "Dear friend,",
      preheader: CAMPAIGN.preheader,
      // CAN-SPAM requires a valid physical postal address in every commercial
      // message. Absent it the template renders a loud placeholder rather
      // than silently shipping non-compliant mail.
      postal_address:
        process.env.DISPATCH_POSTAL_ADDRESS ?? "2420 NE 186th St, Suite 300, Miami, FL 33180",
    };
    return rec;
  });
}

/* ----------------------------------------------------------- template render */

// {{key}} and {{key||fallback}}. Anything unresolved becomes "" rather than
// shipping a literal {{brace}} to a client — a visible merge tag is the most
// obvious "this is bulk mail" tell there is.
function render(template, merge) {
  return template.replace(/\{\{\s*([a-z_]+)\s*(?:\|\|([^}]*))?\}\}/gi, (_, key, fallback) => {
    const v = merge[key.trim()];
    if (v !== undefined && v !== null && String(v).length) return String(v);
    return (fallback ?? "").trim();
  });
}

// Multipart matters: an HTML-only body is a spam signal at every major
// provider. Prefer a hand-written emails/<slug>.txt if one exists.
function plainTextFor(html, slug) {
  const override = path.join("emails", `${slug}.txt`);
  if (existsSync(override)) return readFileSync(override, "utf8");
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<a[^>]+href="(mailto:[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "$2")
    .replace(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
    .replace(/<\/(p|tr|div|h1|h2|table)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&middot;/g, "·").replace(/&mdash;/g, "—").replace(/&rarr;/g, "->")
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"')
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
    .replace(/&Ccedil;/g, "Ç").replace(/&ccedil;/g, "ç")
    .replace(/&eacute;/g, "é").replace(/&egrave;/g, "è")
    .replace(/&deg;/g, "°").replace(/&prime;/g, "'").replace(/&shy;/g, "")
    // Numeric entities, not just named ones. The preheader is padded with
    // &#847;/&#8199; to stop clients pulling body copy in after it — invisible
    // in HTML, but it lands as literal "&#847;" in text if left alone.
    .replace(/&#\d+;/g, "")
    .replace(/&[a-z]+;/gi, "")
    .replace(/[ \t]+/g, " ")
    .replace(/^[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ----------------------------------------------------------------- reporting */

function audit(contacts) {
  const sendable = contacts.filter((c) => !c.skip);
  const blocked = contacts.filter((c) => c.skip);

  const by = (list, key) =>
    [...list.reduce((m, c) => m.set(c[key], (m.get(c[key]) ?? 0) + 1), new Map())].sort(
      (a, b) => b[1] - a[1],
    );

  const domains = by(
    sendable.map((c) => ({ d: c.email.split("@")[1] })),
    "d",
  );

  console.log(`\nrows read            ${contacts.length}`);
  console.log(`sendable             ${sendable.length}`);
  console.log(`blocked              ${blocked.length}`);

  console.log(`\nblocked, by reason`);
  for (const [reason, n] of by(blocked, "skip")) console.log(`  ${String(n).padStart(4)}  ${reason}`);

  console.log(`\nmailbox providers (top 8) — these set the bulk-sender bar`);
  const consumer = new Set(["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "me.com", "icloud.com", "yahoo.ca", "live.com", "msn.com"]);
  let consumerCount = 0;
  for (const [d, n] of domains) {
    if (consumer.has(d)) consumerCount += n;
  }
  for (const [d, n] of domains.slice(0, 8)) {
    console.log(`  ${String(n).padStart(4)}  ${d}`);
  }
  const pct = sendable.length ? Math.round((consumerCount / sendable.length) * 100) : 0;
  console.log(`  → ${pct}% consumer mailboxes; Gmail/Yahoo require SPF+DKIM+DMARC,`);
  console.log(`    one-click unsubscribe, and complaints under 0.3% (aim <0.1%).`);

  const warned = sendable.filter((c) => c.warn.length);
  console.log(`\npersonalisation warnings  ${warned.length} of ${sendable.length} sendable`);
  for (const c in {}) void c;
  const grouped = new Map();
  for (const c of warned) for (const w of c.warn) grouped.set(w, [...(grouped.get(w) ?? []), c]);
  for (const [w, list] of [...grouped].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${String(list.length).padStart(4)}  ${w}`);
    for (const c of list.slice(0, 6)) {
      console.log(`          row ${c.rowNumber}: "${c.rawFirst} ${c.rawLast}" <${c.email || "—"}>`);
    }
    if (list.length > 6) console.log(`          … and ${list.length - 6} more`);
  }
  console.log(
    `\nAll warned rows still send — they just get "Dear friend," instead of a\n` +
      `name that would look wrong to whoever opens the message.\n`,
  );
  return sendable;
}

/* ------------------------------------------------------------ suppressions */

// The do-not-email list is the site's email_suppressions table, written by
// /api/unsubscribe. Reading it needs the service role, because the anon role
// is deliberately allowed to insert but never to select — otherwise the table
// would be a public list of everyone who ever opted out.
async function loadSuppressions() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null; // caller decides whether that is fatal

  const res = await fetch(`${url}/rest/v1/email_suppressions?select=email`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`suppression read failed: ${res.status} ${await res.text()}`);
  return new Set((await res.json()).map((r) => String(r.email).trim().toLowerCase()));
}

/* --------------------------------------------------------------------- send */

async function sendBatch(batch, from, replyTo) {
  const res = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(batch),
  });
  if (!res.ok) throw new Error(`resend batch failed: ${res.status} ${await res.text()}`);
  return (await res.json()).data ?? [];
}

/* --------------------------------------------------------------------- main */

async function main() {
  const templatePath = CAMPAIGN.templateFile;
  if (!existsSync(templatePath)) throw new Error(`template not found: ${templatePath}`);
  const template = readFileSync(templatePath, "utf8");

  const leftover = template.match(/\{\{\s*[a-z_]+\s*\}\}/gi) ?? [];
  const known = new Set(["first_name", "last_name", "email", "greeting", "preheader", "postal_address", "unsubscribe_url"]);
  const unknown = [...new Set(leftover)].filter(
    (t) => !known.has(t.replace(/[{}\s]/g, "").split("||")[0]),
  );
  if (unknown.length) console.warn(`warning: unrecognised merge tags in template: ${unknown.join(", ")}`);

  if (has("--render-test")) {
    // Offline check that every merge field resolves and no literal {{brace}}
    // survives. Needs no credentials and touches no network.
    const sample = {
      first_name: "Eileen",
      last_name: "Jarvis",
      email: "ebjarvis@example.com",
      greeting: "Dear Eileen,",
      preheader: CAMPAIGN.preheader,
      postal_address: "2420 NE 186th St, Suite 300, Miami, FL 33180",
      unsubscribe_url: "https://www.bonvtravelcompany.com/unsubscribe?e=x&t=y",
    };
    const html = render(template, sample);
    const stray = html.match(/\{\{[^}]*\}\}/g) ?? [];
    console.log(`rendered ${html.length} bytes`);
    console.log(stray.length ? `FAIL unresolved tags: ${stray.join(", ")}` : "all merge tags resolved");

    const bare = render(template, { email: "x@example.com" }); // everything else missing
    const strayBare = bare.match(/\{\{[^}]*\}\}/g) ?? [];
    console.log(
      strayBare.length
        ? `FAIL fallbacks left tags: ${strayBare.join(", ")}`
        : "fallbacks cover every tag when merge data is missing",
    );
    console.log(`greeting fallback renders as: ${/Dear [^<]*/.exec(bare)?.[0] ?? "(not found)"}`);
    const text = plainTextFor(html, CAMPAIGN.slug);
    console.log(`plain-text alternative: ${text.length} bytes, ${text.split("\n").length} lines`);

    // --render-out writes a paste-ready copy: every merge tag resolved to its
    // fallback, so it can go straight into a mail client or an ESP editor.
    // The unsubscribe URL stays a visible placeholder rather than a dead link.
    const out = val("--render-out", null);
    if (out) {
      const ready = render(template, {
        greeting: "Dear friend,",
        preheader: CAMPAIGN.preheader,
        email: "this address",
        postal_address:
          process.env.DISPATCH_POSTAL_ADDRESS ?? "2420 NE 186th St, Suite 300, Miami, FL 33180",
        unsubscribe_url: "*|UNSUB|*",
      });
      writeFileSync(out, ready, "utf8");
      writeFileSync(out.replace(/\.html?$/, "") + ".txt", plainTextFor(ready, CAMPAIGN.slug), "utf8");
      console.log(`wrote ${out} and its .txt twin`);
    }
    return;
  }

  const { token, rows } = await readSheet();
  let contacts = buildContacts(rows);
  let sendable = audit(contacts);

  if (ONLY) sendable = sendable.filter((c) => c.email === ONLY.toLowerCase());
  if (LIMIT) sendable = sendable.slice(0, LIMIT);

  if (MODE === "fix-rows") {
    // Move a mis-typed address out of column A and into column B, and blank
    // the A cell so the row falls back to the neutral salutation. Nothing
    // else on the row is touched, and no name is invented from an address.
    const broken = contacts.filter((c) => c.recovered);
    if (!broken.length) {
      console.log("no column-shifted rows to correct.");
      return;
    }
    console.log(`correcting ${broken.length} row(s):`);
    for (const c of broken) console.log(`  row ${c.rowNumber}: A "${c.rawFirst}" -> B "${c.email}"`);

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchUpdate`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          valueInputOption: "RAW",
          data: broken.flatMap((c) => [
            { range: `${TAB}!A${c.rowNumber}`, values: [[""]] },
            { range: `${TAB}!B${c.rowNumber}`, values: [[c.email]] },
          ]),
        }),
      },
    );
    if (!res.ok) throw new Error(`fix-rows write failed: ${res.status} ${await res.text()}`);
    console.log(`done. Re-run --audit to confirm they now count as sendable.`);
    return;
  }

  if (MODE === "audit") {
    console.log(`audit only — nothing sent. Re-run with --dry-run to render, --send to deliver.`);
    return;
  }

  if (MODE === "dry-run") {
    for (const c of sendable.slice(0, 3)) {
      const html = render(template, { ...c.merge, unsubscribe_url: "https://example.invalid/u" });
      console.log(`\n${"─".repeat(70)}\nto: ${c.email}\nsubject: ${CAMPAIGN.subject}`);
      console.log(`greeting: ${c.merge.greeting}`);
      console.log(`\n--- text/plain ---\n${plainTextFor(html, CAMPAIGN.slug).slice(0, 900)}…`);
    }
    console.log(`\ndry run — ${sendable.length} would receive this. Nothing sent.`);
    return;
  }

  const suppressed = await loadSuppressions();
  if (suppressed === null) {
    throw new Error(
      "Refusing to send without the suppression list. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY so unsubscribes can be honoured — mailing someone who " +
        "opted out is the one mistake with legal weight.",
    );
  }
  const before = sendable.length;
  sendable = sendable.filter((c) => !suppressed.has(c.email));
  if (before !== sendable.length) {
    console.log(`skipping ${before - sendable.length} previously unsubscribed address(es).`);
  }

  const from = process.env.DISPATCH_FROM;
  if (!from) throw new Error("DISPATCH_FROM is not set");
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  const replyTo = process.env.DISPATCH_REPLY_TO ?? from;

  console.log(`sending to ${sendable.length} recipients as ${from}…`);
  const updates = [];

  for (let i = 0; i < sendable.length; i += RESEND_BATCH_MAX) {
    const chunk = sendable.slice(i, i + RESEND_BATCH_MAX);
    const batch = chunk.map((c) => {
      const unsub = unsubscribeUrl(c.email);
      const html = render(template, { ...c.merge, unsubscribe_url: unsub });
      return {
        from,
        to: [c.email],
        reply_to: replyTo,
        subject: CAMPAIGN.subject,
        html,
        text: plainTextFor(html, CAMPAIGN.slug),
        headers: {
          // RFC 8058. Gmail and Yahoo both require this for bulk senders, and
          // an easy unsubscribe is what keeps complaints — the metric that
          // actually decides inbox placement — off the floor.
          // Points at the API route, which is POST-only. The visible footer
          // link goes to the page instead, which asks before it acts.
          "List-Unsubscribe": `<${unsub.replace("/unsubscribe?", "/api/unsubscribe?")}>, <mailto:jordan.yates@luxurycruiseconnections.com?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        tags: [
          { name: "campaign", value: CAMPAIGN.slug },
        ],
      };
    });

    let results = [];
    try {
      results = await sendBatch(batch, from, replyTo);
    } catch (err) {
      console.error(`batch starting at ${i} failed: ${err.message}`);
      chunk.forEach((c) => updates.push({ rowNumber: c.rowNumber, value: `ERROR: ${err.message.slice(0, 120)}` }));
      continue;
    }

    chunk.forEach((c, n) => {
      const id = results[n]?.id ?? "";
      updates.push({ rowNumber: c.rowNumber, value: `SENT ${new Date().toISOString()} ${id}`.trim() });
    });

    console.log(`  ${Math.min(i + RESEND_BATCH_MAX, sendable.length)}/${sendable.length}`);
    if (i + RESEND_BATCH_MAX < sendable.length) {
      await new Promise((r) => setTimeout(r, PAUSE_BETWEEN_BATCHES_MS));
    }
  }

  await writeStatuses(token, updates);
  console.log(`done — ${updates.length} rows stamped in column ${STATUS_COLUMN_LETTER}.`);
}

main().catch((err) => {
  console.error(`\n${err.message}\n`);
  process.exit(1);
});
