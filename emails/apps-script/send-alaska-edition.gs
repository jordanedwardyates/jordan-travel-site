/**
 * STAMPED: The Weekly Edit — The Alaska Edition
 * "Alaska for less than a Celebrity suite, first class flights included"
 *
 * Personalised Gmail send, pulled live from the saved draft, capped at
 * 1,500/day and paced across a daytime window by a half-hourly trigger.
 *
 * ── HOW IT WORKS ────────────────────────────────────────────────────────
 * The draft is the single source of truth. This script never duplicates the
 * copy: it reads the draft once per run, swaps the literal "{First Name}"
 * token per recipient, and sends. Edit the draft in Gmail and the next run
 * picks the edit up automatically.
 *
 * ── WHY IT IS PACED ─────────────────────────────────────────────────────
 * One burst of 1,500 near-identical emails from an address that normally
 * sends a few dozen a day is the single biggest spam-filter risk here,
 * larger than any link or image. A single Apps Script execution is also
 * capped at 6 minutes, so "spread over the day" cannot be one long loop
 * with sleeps. Instead a time-driven trigger fires sendBatch() every
 * TRIGGER_MINUTES, and each run sends one slice inside a 07:00–21:00
 * window with a short pause between sends. Nights are left quiet on
 * purpose: mail landing at 3am looks automated to both filters and people.
 *
 * ── THE DAILY CAP IS COUNTED, NOT ASSUMED ───────────────────────────────
 * DAILY_TARGET is enforced by counting rows actually stamped SENT today,
 * read back off the sheet. That survives script restarts, manual runs,
 * trigger overlap and mid-day edits, none of which a counter in script
 * properties would survive. Google's own quota is checked separately and
 * whichever limit is lower wins.
 *
 * ── ONE STATUS COLUMN PER ISSUE ─────────────────────────────────────────
 * Every issue gets its own status column, named in STATUS_HEADER. The
 * script creates it in the first empty header cell if it is not there yet.
 * That is what makes the same sheet reusable issue after issue: a row that
 * was SENT for the last issue is still pending for this one, and nobody has
 * to clear a column by hand (and risk clearing the wrong one). Columns are
 * always found by header name, never by position — the sheet has blank
 * spacer columns, so a hardcoded index would miss data or overwrite it.
 * Every row this script touches gets SENT / SKIPPED / FAILED written in
 * this issue's column, so re-running is always safe: anything already
 * marked is left alone.
 *
 * ── SETUP ───────────────────────────────────────────────────────────────
 *   1. Paste the issue HTML into a NEW Gmail draft by hand. Do not create
 *      the draft through the API — the API strips <img> tags and you will
 *      lose the stamp, the route maps and the signature block.
 *   2. Give the draft the subject in DRAFT_SUBJECT below, exactly, and make
 *      sure no second draft shares it (this script refuses to guess).
 *   3. Run previewBatch()  — writes nothing, logs the first 10 greetings.
 *   4. Run testSend()      — one real email to TEST_EMAIL, writes nothing.
 *      Open it on a phone as well as a desktop. Check both route maps load.
 *   5. Set TEST_MODE = false.
 *   6. Run startCampaign() once. It sends the first slice immediately and
 *      installs the trigger. Close the tab; it continues on its own.
 *
 *   Run campaignStatus() any time for progress. stopCampaign() halts it;
 *   anyone not yet reached simply stays unmarked and is picked up if you
 *   start again.
 */

/* ── CONFIG ───────────────────────────────────────────────────────────── */

var SHEET_ID      = '1Fn0Vx6AUSYiuWD14zSwqCp4Ew30Qi-F9T37WcBNcs3w';  // "7/30 Full List"
var DRAFT_SUBJECT = 'Alaska for less than a Celebrity suite, first class flights included';

var SENDER_NAME = 'Jordan Yates · BON V: A Travel Company';
var REPLY_TO    = 'jordan.yates@luxurycruiseconnections.com';

var DAILY_TARGET   = 1500;   // hard ceiling per calendar day
var WINDOW_START_H = 7;      // send only between 07:00 ...
var WINDOW_END_H   = 21;     // ... and 21:00, script timezone
var TRIGGER_MINUTES = 30;    // how often sendBatch() re-fires

var TEST_MODE  = true;       // leave true until testSend() looks right, then flip to false
var TEST_EMAIL = 'jordan.yates@luxurycruiseconnections.com';

var STATUS_HEADER = 'Alaska Edition';  // this issue's own column; created if missing
var MERGE_TOKEN   = '{First Name}';    // single braces — matches the draft
var EMAIL_RE      = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

var PAUSE_MS         = 1200;  // between sends, with jitter added
var MAX_RUN_SECONDS  = 300;   // bail before Apps Script's 6-minute ceiling
var TRIGGER_HANDLER  = 'sendBatch';

var NAME_TITLES = ['mr','mrs','ms','miss','dr','prof','rev','sir','madam','mister','capt','captain'];

/* ── THINGS YOU RUN ───────────────────────────────────────────────────── */

/** Logs what the next 10 recipients would receive. Writes nothing, sends nothing. */
function previewBatch() {
  var ctx = load_();
  var pending = ctx.pending.slice(0, 10);
  Logger.log('Draft   : "%s"', ctx.subject);
  Logger.log('Column  : "%s" (column %s)', STATUS_HEADER, ctx.cols.status + 1);
  Logger.log('Pending : %s   |   sent today: %s / %s', ctx.pending.length, ctx.sentToday, DAILY_TARGET);
  Logger.log('Quota   : %s remaining today', MailApp.getRemainingDailyQuota());
  Logger.log('Images  : %s inline/attached on the draft (expect the stamp, two maps and the signature to load from the web, so 0 here is fine)',
             ctx.attachments ? ctx.attachments.length : 0);
  Logger.log('--- next %s recipients ---', pending.length);
  pending.forEach(function (r) {
    var name = cleanFirstName_(r.firstName);
    Logger.log('  row %s  %s  ->  %s',
               r.row, r.email, name ? 'Hello ' + name + ',' : 'Hello,   (name unusable: ' + JSON.stringify(r.firstName) + ')');
  });
}

/** Sends exactly one email, to TEST_EMAIL. Writes nothing to the sheet. */
function testSend() {
  var ctx = load_();
  var sample = ctx.pending.length
    ? ctx.pending[0]
    : { row: 0, firstName: 'Jordan', email: TEST_EMAIL };
  deliver_(ctx, { row: sample.row, firstName: sample.firstName, email: TEST_EMAIL });
  Logger.log('Test sent to %s using row %s (%s). Check it before starting the campaign.',
             TEST_EMAIL, sample.row, JSON.stringify(sample.firstName));
}

/** Sends the first slice now, then installs the trigger. */
function startCampaign() {
  if (TEST_MODE) {
    Logger.log('TEST_MODE is still true. Set it to false before starting the campaign.');
    return;
  }
  stopCampaign();
  ScriptApp.newTrigger(TRIGGER_HANDLER).timeBased().everyMinutes(TRIGGER_MINUTES).create();
  Logger.log('Trigger installed (every %s min). Sending the first slice now.', TRIGGER_MINUTES);
  sendBatch();
}

/** Removes the trigger. Unsent rows stay unmarked and resume if you start again. */
function stopCampaign() {
  var n = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === TRIGGER_HANDLER) { ScriptApp.deleteTrigger(t); n++; }
  });
  Logger.log('Removed %s trigger(s).', n);
}

/** Progress report. Writes nothing. */
function campaignStatus() {
  var ctx = load_();
  Logger.log('Draft      : "%s"', ctx.subject);
  Logger.log('Column     : "%s"', STATUS_HEADER);
  Logger.log('Total rows : %s', ctx.totalRows);
  Logger.log('Sent       : %s   (today: %s / %s)', ctx.sentTotal, ctx.sentToday, DAILY_TARGET);
  Logger.log('Pending    : %s', ctx.pending.length);
  Logger.log('Skipped    : %s   Failed: %s', ctx.skipped, ctx.failed);
  Logger.log('Quota left : %s', MailApp.getRemainingDailyQuota());
  var triggers = ScriptApp.getProjectTriggers().filter(function (t) {
    return t.getHandlerFunction() === TRIGGER_HANDLER;
  });
  Logger.log('Trigger    : %s', triggers.length ? 'installed' : 'NOT installed');
  if (ctx.pending.length) {
    var days = Math.ceil(ctx.pending.length / DAILY_TARGET);
    Logger.log('At %s/day the remaining %s take about %s more day(s).', DAILY_TARGET, ctx.pending.length, days);
  }
}

/* ── THE TRIGGER HANDLER ──────────────────────────────────────────────── */

function sendBatch() {
  var started = Date.now();
  var hour = Number(Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'H'));
  if (hour < WINDOW_START_H || hour >= WINDOW_END_H) {
    Logger.log('%s:00 is outside the %s:00–%s:00 window. Nothing sent.', hour, WINDOW_START_H, WINDOW_END_H);
    return;
  }

  var ctx = load_();
  if (!ctx.pending.length) {
    Logger.log('Nothing pending. Campaign complete — removing the trigger.');
    stopCampaign();
    return;
  }

  var allowedToday = Math.max(0, DAILY_TARGET - ctx.sentToday);
  if (!allowedToday) {
    Logger.log('Daily cap reached (%s sent today). Waiting for tomorrow.', ctx.sentToday);
    return;
  }

  // Spread whatever is still owed today across the runs the window has left.
  var runsLeft = Math.max(1, Math.ceil((WINDOW_END_H - hour) * 60 / TRIGGER_MINUTES));
  var slice = Math.ceil(allowedToday / runsLeft);

  var quota = MailApp.getRemainingDailyQuota();
  var batch = Math.min(slice, allowedToday, ctx.pending.length, quota);

  Logger.log('%s:00 — pending %s | sent today %s/%s | quota %s | this run %s',
             hour, ctx.pending.length, ctx.sentToday, DAILY_TARGET, quota, batch);
  if (batch <= 0) { Logger.log('Nothing to send this run.'); return; }

  var sheet = ctx.sheet, sent = 0, failed = 0;
  for (var i = 0; i < batch; i++) {
    if ((Date.now() - started) / 1000 > MAX_RUN_SECONDS) {
      Logger.log('Approaching the execution limit — stopping this run early at %s sent.', sent);
      break;
    }
    var r = ctx.pending[i];
    try {
      deliver_(ctx, r);
      // Stamp immediately, one row at a time. A crash then costs at most the
      // row in flight, never a whole silent batch.
      sheet.getRange(r.row, ctx.cols.status + 1).setValue('SENT ' + new Date().toISOString());
      sent++;
    } catch (err) {
      sheet.getRange(r.row, ctx.cols.status + 1).setValue('FAILED ' + trimErr_(err));
      failed++;
      Logger.log('  row %s (%s) FAILED: %s', r.row, r.email, err);
    }
    SpreadsheetApp.flush();
    Utilities.sleep(PAUSE_MS + Math.floor(Math.random() * 600));  // jitter
  }

  Logger.log('Run finished: %s sent, %s failed. %s remaining overall.',
             sent, failed, ctx.pending.length - sent - failed);
}

/* ── INTERNALS ────────────────────────────────────────────────────────── */

/** Reads the sheet and the draft once, and classifies every row. */
function load_() {
  var sheet  = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  var cols   = findColumns_(sheet);
  var values = sheet.getDataRange().getValues();   // re-read: findColumns_ may have added a header
  var draft  = findDraft_();
  var msg    = draft.getMessage();

  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var pending = [], sentToday = 0, sentTotal = 0, skipped = 0, failed = 0;

  for (var i = 1; i < values.length; i++) {
    var row       = values[i];
    var firstName = str_(row[cols.first]);
    var email     = str_(row[cols.email]).replace(/\s+/g, '').toLowerCase();
    var status    = str_(row[cols.status]);

    // A row whose First Name cell is itself an email address and whose Email
    // cell is blank is a paste error, not a person. Use the address, drop the name.
    if (!email && EMAIL_RE.test(firstName.toLowerCase())) {
      email = firstName.toLowerCase();
      firstName = '';
    }

    if (status) {
      if (/^SENT/.test(status)) {
        sentTotal++;
        // "SENT 2026-09-15T13:02:09.109Z" — compare the calendar day only.
        var stamp = status.replace(/^SENT\s*/, '');
        if (stamp.indexOf(today) === 0) sentToday++;
        else {
          var d = new Date(stamp);
          if (!isNaN(d) && Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd') === today) sentToday++;
        }
      } else if (/^SKIPPED/.test(status)) skipped++;
      else if (/^FAILED/.test(status)) failed++;
      continue;                    // anything already marked is left alone
    }

    if (!EMAIL_RE.test(email)) {
      sheet.getRange(i + 1, cols.status + 1)
           .setValue('SKIPPED: no usable email' + (email ? ' (' + email + ')' : ''));
      skipped++;
      continue;
    }
    pending.push({ row: i + 1, firstName: firstName, email: email });
  }

  return {
    sheet: sheet, cols: cols, pending: pending,
    sentToday: sentToday, sentTotal: sentTotal, skipped: skipped, failed: failed,
    totalRows: values.length - 1,
    subject: msg.getSubject(),
    html: msg.getBody(),
    plain: msg.getPlainBody(),
    attachments: msg.getAttachments({ includeInlineImages: true, includeAttachments: true })
  };
}

/** Sends one merged copy. Throws on failure so the caller can mark FAILED. */
function deliver_(ctx, recipient) {
  var to = TEST_MODE ? TEST_EMAIL : recipient.email;
  GmailApp.sendEmail(to, fillTemplate_(ctx.subject, recipient.firstName),
    fillTemplate_(ctx.plain, recipient.firstName), {
      htmlBody:    fillTemplate_(ctx.html, recipient.firstName),
      name:        SENDER_NAME,
      replyTo:     REPLY_TO,
      attachments: ctx.attachments && ctx.attachments.length ? ctx.attachments : undefined
    });
}

/** Exactly one draft must carry DRAFT_SUBJECT — this refuses to guess. */
function findDraft_() {
  var matches = GmailApp.getDrafts().filter(function (d) {
    return d.getMessage().getSubject() === DRAFT_SUBJECT;
  });
  if (!matches.length) {
    throw new Error('No draft with subject "' + DRAFT_SUBJECT +
                    '". Check it matches exactly, including punctuation and spacing.');
  }
  if (matches.length > 1) {
    throw new Error(matches.length + ' drafts share the subject "' + DRAFT_SUBJECT +
                    '". Delete the extras so there is no ambiguity about which one sends.');
  }
  return matches[0];
}

/**
 * Columns by header text — the sheet has blank spacer columns. The status
 * column is this issue's own; if it does not exist yet it is created in the
 * first empty header cell (or appended after the last one).
 */
function findColumns_(sheet) {
  var header = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
  var idx = { first: -1, email: -1, status: -1 };
  var firstEmpty = -1;
  for (var i = 0; i < header.length; i++) {
    var h = str_(header[i]).toLowerCase();
    if (h === 'first name') idx.first = i;
    else if (h === 'email') idx.email = i;
    else if (h === STATUS_HEADER.toLowerCase()) idx.status = i;
    else if (!h && firstEmpty === -1) firstEmpty = i;
  }
  if (idx.first === -1 || idx.email === -1) {
    throw new Error('Could not find "First Name" and "Email" headers in row 1.');
  }
  if (idx.status === -1) {
    idx.status = firstEmpty !== -1 ? firstEmpty : header.length;
    sheet.getRange(1, idx.status + 1).setValue(STATUS_HEADER);
    SpreadsheetApp.flush();
    Logger.log('Added "%s" header at column %s.', STATUS_HEADER, idx.status + 1);
  }
  return idx;
}

/** Merges one recipient, collapsing the greeting when the name is unusable. */
function fillTemplate_(text, rawFirstName) {
  var name = cleanFirstName_(rawFirstName);
  var s = String(text == null ? '' : text);
  if (!name) s = s.split('Hello ' + MERGE_TOKEN + ',').join('Hello,');
  return s.split(MERGE_TOKEN).join(name);
}

/** Display-ready first name, or '' when the cell is unusable. */
function cleanFirstName_(raw) {
  var s = String(raw == null ? '' : raw).trim();
  if (!s) return '';
  s = s.replace(/["`]/g, '').replace(/^['\s]+|['\s]+$/g, '').trim();
  if (!s) return '';
  if (s.indexOf('@') !== -1) return '';                 // email in the name column
  if (/\d/.test(s)) return '';                          // digits are never a first name
  if (/^[A-Za-z]\.?$/.test(s)) return '';               // bare initial: "F", "J."
  if (NAME_TITLES.indexOf(s.toLowerCase().replace(/\./g, '')) !== -1) return '';   // "MR"
  if (/[\/&,]|\band\b|\bor\b/i.test(s)) {               // "Shelley/suzanne"
    s = s.split(/[\/&,]|\band\b|\bor\b/i)[0].trim();
    if (!s || NAME_TITLES.indexOf(s.toLowerCase().replace(/\./g, '')) !== -1) return '';
  }
  if (s === s.toLowerCase() || s === s.toUpperCase()) { // FOWLER / charles -> Fowler / Charles
    s = s.toLowerCase().replace(/(^|[\s\-'])([a-z])/g, function (m, sep, ch) {
      return sep + ch.toUpperCase();
    });
  }
  return s;                                             // McRae / DeAnne / Eva-Marie untouched
}

function str_(v)     { return String(v == null ? '' : v).trim(); }
function trimErr_(e) { return String(e && e.message ? e.message : e).slice(0, 120); }
