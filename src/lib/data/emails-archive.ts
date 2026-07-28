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
  kind: "campaign" | "one-off-invitation" | "one-off-quote-options";
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
    slug: "sonata-inaugural-invitation",
    file: "emails/sonata-inaugural-invitation.html",
    title: "Robert Glass — Sonata inaugural invitation",
    kind: "one-off-invitation",
    recipient: "Robert Glass",
    sentAt: "2026-07-27",
    trackedInDb: false,
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
];
