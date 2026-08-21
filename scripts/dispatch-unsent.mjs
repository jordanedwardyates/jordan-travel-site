#!/usr/bin/env node
/**
 * Who never got the last letter.
 *
 *   node scripts/dispatch-unsent.mjs                  # every tab, summarised
 *   node scripts/dispatch-unsent.mjs --tab Sheet1     # one tab
 *   node scripts/dispatch-unsent.mjs --csv unsent.csv # export the list
 *   node scripts/dispatch-unsent.mjs --list           # print every address
 *
 * Reads the contacts sheet and splits it three ways on the status column:
 *
 *   sent    the August send stamped a timestamp here
 *   failed  it tried and could not — "SKIPPED: no email" and friends
 *   unsent  the cell is empty, so this person was never attempted at all
 *
 * The last two are the interesting ones. `failed` rows are usually fixable
 * data-entry problems; `unsent` rows are people the previous run simply never
 * reached, which on this list is most of the tail.
 *
 * Scans every tab by default, because the sheet's row count has not matched
 * expectations and a second tab is the likeliest explanation.
 *
 * Env: GOOGLE_SERVICE_ACCOUNT_JSON, and optionally DISPATCH_SHEET_ID.
 */

import { writeFileSync } from "node:fs";
import {
  googleAccessToken,
  listTabs,
  readTab,
  parseRows,
  dedupeByEmail,
  toCsv,
} from "./lib/dispatch-list.mjs";

const SHEET_ID = process.env.DISPATCH_SHEET_ID ?? "1Fn0Vx6AUSYiuWD14zSwqCp4Ew30Qi-F9T37WcBNcs3w";
const STATUS_COL = process.env.DISPATCH_STATUS_COL ?? "C";

const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const value = (f, d = null) => {
  const hit = argv.find((a) => a.startsWith(`${f}=`));
  if (hit) return hit.slice(f.length + 1);
  const i = argv.indexOf(f);
  return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};

const ONLY_TAB = value("--tab", null);
const CSV_PATH = value("--csv", null);
const SHOW_ALL = flag("--list");

const pad = (n, w = 5) => String(n).padStart(w);

async function main() {
  const token = await googleAccessToken();
  const { title, tabs } = await listTabs(SHEET_ID, token);

  console.log(`\nspreadsheet: ${title}`);
  console.log(`tabs: ${tabs.map((t) => t.title).join(", ")}\n`);

  const wanted = ONLY_TAB ? tabs.filter((t) => t.title === ONLY_TAB) : tabs;
  if (!wanted.length) {
    throw new Error(`no tab named "${ONLY_TAB}". Available: ${tabs.map((t) => t.title).join(", ")}`);
  }

  const all = [];

  for (const tab of wanted) {
    const rows = await readTab(SHEET_ID, tab.title, token);
    if (rows.length < 2) {
      console.log(`${tab.title}: empty`);
      continue;
    }
    const records = parseRows(rows, { statusCol: STATUS_COL }).map((r) => ({ ...r, tab: tab.title }));
    all.push(...records);

    const sent = records.filter((r) => r.sendState === "sent").length;
    const failed = records.filter((r) => r.sendState === "failed").length;
    const unsent = records.filter((r) => r.sendState === "unsent").length;
    console.log(
      `${tab.title.padEnd(24)} ${pad(records.length)} rows   ` +
        `${pad(sent)} sent   ${pad(failed)} failed   ${pad(unsent)} never attempted`,
    );
  }

  if (!all.length) {
    console.log("\nnothing to report.");
    return;
  }

  // The people who did not get it, either way.
  const missed = all.filter((r) => r.sendState !== "sent");
  const { unique, dupes } = dedupeByEmail(missed);
  const mailable = unique.filter((r) => !r.mailable);
  const unmailable = unique.filter((r) => r.mailable);
  const recovered = mailable.filter((r) => r.recovered);

  console.log(`\n${"─".repeat(72)}`);
  console.log(`total rows              ${pad(all.length)}`);
  console.log(`already sent            ${pad(all.filter((r) => r.sendState === "sent").length)}`);
  console.log(`did NOT get it          ${pad(missed.length)}`);
  console.log(`  ├─ mailable today     ${pad(mailable.length)}${recovered.length ? `   (${recovered.length} after recovering a mis-typed address)` : ""}`);
  console.log(`  ├─ duplicate address  ${pad(dupes.length)}`);
  console.log(`  └─ unmailable         ${pad(unmailable.length)}`);

  if (unmailable.length) {
    console.log(`\nunmailable — these need a human:`);
    for (const r of unmailable) {
      console.log(`  ${r.tab} row ${String(r.rowNumber).padStart(4)}  ${r.displayName.padEnd(28)} ${r.mailable}`);
    }
  }

  if (recovered.length) {
    console.log(`\nrecovered from the first-name column (run dispatch-send.mjs --fix-rows to persist):`);
    for (const r of recovered) {
      console.log(`  ${r.tab} row ${String(r.rowNumber).padStart(4)}  ${r.email}`);
    }
  }

  if (dupes.length) {
    console.log(`\nduplicate addresses, already counted once above:`);
    for (const r of dupes.slice(0, 15)) {
      console.log(`  ${r.tab} row ${String(r.rowNumber).padStart(4)}  ${r.email}`);
    }
    if (dupes.length > 15) console.log(`  … and ${dupes.length - 15} more`);
  }

  const byDomain = [...mailable.reduce((m, r) => {
    const d = r.email.split("@")[1];
    return m.set(d, (m.get(d) ?? 0) + 1);
  }, new Map())].sort((a, b) => b[1] - a[1]);
  console.log(`\nmailable, by provider:`);
  for (const [d, n] of byDomain.slice(0, 10)) console.log(`  ${pad(n)}  ${d}`);
  if (byDomain.length > 10) console.log(`  ${pad(byDomain.slice(10).reduce((s, [, n]) => s + n, 0))}  (${byDomain.length - 10} other domains)`);

  if (SHOW_ALL) {
    console.log(`\nevery mailable address that missed the last send:`);
    for (const r of mailable) {
      console.log(`  ${r.tab} row ${String(r.rowNumber).padStart(4)}  ${r.email.padEnd(38)} ${r.displayName}`);
    }
  }

  if (CSV_PATH) {
    const csv = toCsv(
      mailable.map((r) => ({
        tab: r.tab,
        row: r.rowNumber,
        first_name: r.firstName ?? "",
        last_name: r.lastName ?? "",
        email: r.email,
        why: r.sendState === "failed" ? `previous run: ${r.status}` : "never attempted",
        address_recovered: r.recovered ? "yes" : "",
      })),
      ["tab", "row", "first_name", "last_name", "email", "why", "address_recovered"],
    );
    writeFileSync(CSV_PATH, `${csv}\n`, "utf8");
    console.log(`\nwrote ${mailable.length} rows to ${CSV_PATH}`);
  } else {
    console.log(`\n(--csv <path> to export, --list to print them all)`);
  }
  console.log();
}

main().catch((err) => {
  console.error(`\n${err.message}\n`);
  process.exit(1);
});
