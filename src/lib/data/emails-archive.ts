/**
 * Hand-maintained inventory of every file under emails/ — Dispatch letters
 * AND one-off sends (personal invitations, quote-options letters) that
 * never get a campaigns row. Append an entry here whenever a new file
 * lands in emails/. No DB table backs this: one-offs have no natural row,
 * and volume is low enough that this is the same upkeep as the emails/
 * README table it mirrors.
 */

export type ArchivedEmail = {
  slug: string;
  file: string;
  title: string;
  kind: "campaign" | "broadcast" | "one-off-invitation" | "one-off-quote-options";
  recipient: string | null;
  sentAt: string | null;
  trackedInDb: boolean;
  notes?: string;
};

export const ARCHIVED_EMAILS: ArchivedEmail[] = [
  {
    slug: "dispatch-crossings-mediterranean",
    file: "emails/dispatch-crossings-mediterranean.html",
    title: "The Crossings & the Mediterranean",
    kind: "campaign",
    recipient: null,
    sentAt: null,
    trackedInDb: true,
    notes: "Draft — see Dispatch performance above (No. 001)",
  },
  {
    slug: "dispatch-seabourn-before-she-turns-west",
    file: "emails/dispatch-seabourn-before-she-turns-west.html",
    title: "Before the Quest Turns West",
    kind: "campaign",
    recipient: null,
    sentAt: null,
    trackedInDb: false,
    notes:
      "Draft — see emails/README.md (No. 002). Fares sourced from the SBN_MI_USD_8.5.26 rate sheet (Aug 5, 2026 snapshot); no campaigns row yet, so per-card links are mailto (voyage code in the subject) rather than tracked UTM links. Confirm fares are per-person before send.",
  },
  {
    slug: "sonata-inaugural-invitation",
    file: "emails/sonata-inaugural-invitation.html",
    title: "Oceania Sonata — inaugural invitation",
    kind: "broadcast",
    recipient: "~500+ contacts",
    sentAt: "2026-07-27",
    trackedInDb: false,
    notes:
      "Sent via Gmail — opens/clicks not tracked. Success shows up as replies and quotes below.",
  },
  {
    slug: "eddy-february-options",
    file: "emails/eddy-february-options.html",
    title: "Eddy — February sailing options",
    kind: "one-off-quote-options",
    recipient: "Eddy",
    sentAt: null,
    trackedInDb: false,
    notes: "Send date unconfirmed",
  },
  {
    slug: "liebig-panama-marina-options",
    file: "emails/liebig-panama-marina-options.html",
    title: "Nancy Liebig — Marina, Panama Canal options",
    kind: "one-off-quote-options",
    recipient: "Nancy Liebig",
    sentAt: null,
    trackedInDb: false,
    notes:
      "Oceania Marina MNA270305 (Miami→Panama, Mar 5 2027) + optional return MNA270315 (Panama→Miami, Mar 15 2027). Confirms the Oct 2026 OceaniaNEXT refit she asked about. Draft — not yet sent.",
  },
];
