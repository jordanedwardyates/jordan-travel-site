/**
 * Campaign — "The Aegean & the Atlantic" (Dispatch No. 002)
 * Personalized Gmail send, pulled live from a saved Gmail draft, paced
 * across the sheet's daily send quota via a time-driven trigger.
 *
 * SETUP
 * 1. Open the contacts spreadsheet -> Extensions -> Apps Script.
 * 2. Paste this file in as Code.gs (or a new file).
 * 3. Fill in CONFIG below: the tab name, the column letters, and DRAFT_SUBJECT_MATCH.
 * 4. Compose the letter as a Gmail draft in the SAME account this script will
 *    run as. Subject must contain DRAFT_SUBJECT_MATCH. Body can be the full
 *    HTML letter (Gmail preserves formatting from a draft). Put {{first_name}}
 *    wherever a name belongs — this script replaces it before sending, so
 *    whatever token you use here just needs to match what you typed in the
 *    draft. Nothing about Resend, HubSpot, or any other tool's merge syntax
 *    matters once the send happens this way.
 * 5. Run testSend() first, from the function dropdown. It sends ONE email —
 *    to yourself — and touches nothing in the sheet. Check it in an actual
 *    inbox before anything else.
 * 6. Run installTrigger() once. It sets processBatch() to fire every 30
 *    minutes; each firing sends as many as the remaining daily Gmail quota
 *    allows, then stops itself and waits for the next firing.
 * 7. To stop mid-send: run removeTriggers().
 *
 * WHY A DRAFT AND NOT A TEMPLATE STRING IN THIS FILE
 * The letter is the version-controlled HTML in emails/dispatch-aegean-and-
 * the-atlantic.html. Keeping the *sent* copy as a live Gmail draft (built by
 * pasting that HTML in) means what you can see and proofread in Gmail is
 * exactly what goes out — no second copy of the letter to keep in sync here.
 *
 * WHY THIS PROCESSES THE WHOLE SHEET BY STATUS, NOT A ROW RANGE
 * A row-range batch ("rows 1500-3000") stops lining up with the sheet the
 * moment anyone sorts, filters, or inserts a row. Status-column filtering
 * doesn't have that problem: anything already SENT/SKIPPED/FAILED is left
 * alone, and everything else with a valid email gets processed. That is the
 * only definition of "the rest of the list" that survives the sheet being
 * touched between runs.
 *
 * QUOTA
 * Gmail via GmailApp: 500/day on a plain Gmail account, 1,500/day on Google
 * Workspace. MailApp.getRemainingDailyQuota() reports what's actually left
 * *today*, across everything this account has sent — including manual mail —
 * so the script checks it before every single send, not just once per run.
 */

const CONFIG = {
  TAB: "Sheet1", // the tab holding contacts — confirm against the real sheet
  COL: {
    firstName: "A",
    email: "B",
    status: "C", // "SENT <iso>" / "SKIPPED: <reason>" / "FAILED: <reason>" / blank = not yet attempted
    lastName: "F",
  },
  DRAFT_SUBJECT_MATCH: "The Aegean & the Atlantic", // must appear in the draft's subject line
  SUBJECT_TO_SEND: "The Aegean & the Atlantic",
  TEST_RECIPIENT: Session.getActiveUser().getEmail(),
  BATCH_MAX_PER_RUN: 80, // stay comfortably under a single Apps Script execution's time limit
  MAX_RUNTIME_MS: 4.5 * 60 * 1000, // bail out with room to spare before Apps Script kills the run
  PAUSE_BETWEEN_SENDS_MS: 1100, // Gmail throttles bursts; a small gap avoids tripping that
  TRIGGER_INTERVAL_MINUTES: 30,
};

const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i;

/* ------------------------------------------------------------------ setup */

function installTrigger() {
  removeTriggers();
  ScriptApp.newTrigger("processBatch")
    .timeBased()
    .everyMinutes(CONFIG.TRIGGER_INTERVAL_MINUTES)
    .create();
  Logger.log(
    `Trigger installed: processBatch() every ${CONFIG.TRIGGER_INTERVAL_MINUTES} minutes. ` +
      `Run removeTriggers() to stop it.`,
  );
}

function removeTriggers() {
  const triggers = ScriptApp.getProjectTriggers().filter(
    (t) => t.getHandlerFunction() === "processBatch",
  );
  triggers.forEach((t) => ScriptApp.deleteTrigger(t));
  Logger.log(`Removed ${triggers.length} trigger(s).`);
}

/* -------------------------------------------------------------- the draft */

function findDraftMessage_() {
  const drafts = GmailApp.getDrafts();
  const match = drafts.find((d) =>
    d.getMessage().getSubject().includes(CONFIG.DRAFT_SUBJECT_MATCH),
  );
  if (!match) {
    throw new Error(
      `No Gmail draft found with "${CONFIG.DRAFT_SUBJECT_MATCH}" in the subject. ` +
        `Save the letter as a draft in this account first.`,
    );
  }
  return match.getMessage();
}

function personalize_(text, firstName) {
  const name = firstName && firstName.trim() ? firstName.trim() : "friend";
  return text.split("{{first_name}}").join(name);
}

/* ----------------------------------------------------------------- sheet */

function colIndex_(letter) {
  return letter
    .toUpperCase()
    .split("")
    .reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
}

function readRows_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.TAB);
  if (!sheet) throw new Error(`No tab named "${CONFIG.TAB}" in this spreadsheet.`);
  const values = sheet.getDataRange().getValues();
  return { sheet, values };
}

function writeStatus_(sheet, rowNumber, text) {
  sheet.getRange(rowNumber, colIndex_(CONFIG.COL.status)).setValue(text);
  SpreadsheetApp.flush(); // commit immediately — a send that succeeds and then the
  // script crashes before flushing would otherwise resend on the next run
}

/* -------------------------------------------------------------------- QA */

/** Sends ONE email, to yourself, using the live draft. Touches no sheet row. */
function testSend() {
  const draftMsg = findDraftMessage_();
  const htmlBody = personalize_(draftMsg.getBody(), "Jordan");
  GmailApp.sendEmail(CONFIG.TEST_RECIPIENT, CONFIG.SUBJECT_TO_SEND, "", {
    htmlBody,
    name: "Jordan Yates",
  });
  Logger.log(`Test sent to ${CONFIG.TEST_RECIPIENT}. Check that inbox before running anything else.`);
}

/* ------------------------------------------------------------------- send */

/**
 * Fired by the trigger (or run manually). Sends to everyone with a blank
 * status and a usable email, up to whichever comes first: BATCH_MAX_PER_RUN,
 * the remaining daily Gmail quota, or MAX_RUNTIME_MS. Safe to re-run — rows
 * it already touched are skipped on the next pass.
 */
function processBatch() {
  const start = Date.now();
  const draftMsg = findDraftMessage_();
  const rawHtml = draftMsg.getBody();

  const { sheet, values } = readRows_();
  const iFirst = colIndex_(CONFIG.COL.firstName) - 1;
  const iEmail = colIndex_(CONFIG.COL.email) - 1;
  const iStatus = colIndex_(CONFIG.COL.status) - 1;
  const iLast = colIndex_(CONFIG.COL.lastName) - 1;

  let quota = MailApp.getRemainingDailyQuota();
  let sent = 0,
    skipped = 0,
    failed = 0;

  for (let r = 1; r < values.length; r++) {
    // header row is index 0
    if (Date.now() - start > CONFIG.MAX_RUNTIME_MS) {
      Logger.log("Stopping — approaching this execution's time limit. Next trigger firing continues.");
      break;
    }
    if (sent >= CONFIG.BATCH_MAX_PER_RUN) {
      Logger.log(`Stopping — hit BATCH_MAX_PER_RUN (${CONFIG.BATCH_MAX_PER_RUN}) for this run.`);
      break;
    }
    if (quota <= 0) {
      Logger.log("Stopping — Gmail's remaining daily quota is 0. Resumes automatically tomorrow.");
      break;
    }

    const row = values[r];
    const status = String(row[iStatus] || "").trim();
    if (status) continue; // already SENT / SKIPPED / FAILED — leave it alone

    const rowNumber = r + 1; // 1-indexed for Range access
    let email = String(row[iEmail] || "").trim().toLowerCase();
    let firstName = String(row[iFirst] || "").trim();

    // Column-shift recovery: a handful of rows have the address typed into
    // the first-name cell with Email left blank.
    if (!email && firstName.includes("@") && EMAIL_RE.test(firstName)) {
      email = firstName.toLowerCase();
      firstName = "";
    }

    if (!email || !EMAIL_RE.test(email)) {
      writeStatus_(sheet, rowNumber, "SKIPPED: no usable email");
      skipped++;
      continue;
    }

    try {
      const html = personalize_(rawHtml, firstName);
      GmailApp.sendEmail(email, CONFIG.SUBJECT_TO_SEND, "", {
        htmlBody: html,
        name: "Jordan Yates",
      });
      writeStatus_(sheet, rowNumber, `SENT ${new Date().toISOString()}`);
      sent++;
      quota--;
      Utilities.sleep(CONFIG.PAUSE_BETWEEN_SENDS_MS);
    } catch (err) {
      writeStatus_(sheet, rowNumber, `FAILED: ${String(err.message || err).slice(0, 200)}`);
      failed++;
    }
  }

  Logger.log(`This run — sent: ${sent}, skipped: ${skipped}, failed: ${failed}, quota left: ${quota}`);
}

/* ------------------------------------------------------------- reporting */

/** Quick counts without sending anything. Safe to run any time. */
function reportOnly() {
  const { values } = readRows_();
  const iEmail = colIndex_(CONFIG.COL.email) - 1;
  const iStatus = colIndex_(CONFIG.COL.status) - 1;

  let sentN = 0,
    skippedN = 0,
    failedN = 0,
    unsentN = 0;
  for (let r = 1; r < values.length; r++) {
    const status = String(values[r][iStatus] || "").trim();
    if (/^SENT\b/i.test(status)) sentN++;
    else if (/^SKIPPED\b/i.test(status)) skippedN++;
    else if (/^FAILED\b/i.test(status)) failedN++;
    else unsentN++;
  }
  Logger.log(
    `rows: ${values.length - 1}  sent: ${sentN}  skipped: ${skippedN}  ` +
      `failed: ${failedN}  not yet attempted: ${unsentN}  ` +
      `quota remaining today: ${MailApp.getRemainingDailyQuota()}`,
  );
}
