import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { listCuratedVoyages, blockersFor } from "@/lib/data/curation";

/**
 * Runs weekly (see vercel.json) and nudges Jordan back to
 * /internal/quotes when the front page needs a human decision:
 *
 *   - a featured sailing has passed its 30-day review date
 *   - a featured sailing's hard expiry is within a week
 *   - nothing at all is currently featured
 *   - fresh, publish-ready sailings are sitting unfeatured
 *
 * Every quote gets captured automatically; nothing gets published without
 * this loop bringing it back to a person. If none of the above applies,
 * the run sends nothing — a clean inbox is the point, not a weekly ritual.
 */

export const dynamic = "force-dynamic";

const EXPIRY_WARNING_DAYS = 7;
const CANDIDATE_CAP = 8;

function isAuthorized(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const money = (n: number | null) =>
  n === null ? "—" : `$${n.toLocaleString("en-US")}`;

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.INTERNAL_PREVIEW_TOKEN;
  const deskUrl = token
    ? `https://www.bonvtravelcompany.com/internal/quotes?key=${token}`
    : "https://www.bonvtravelcompany.com/internal/quotes";

  let voyages;
  try {
    voyages = await listCuratedVoyages();
  } catch (err) {
    console.error("Curation digest: failed to load voyages:", err);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const soon = new Date(Date.now() + EXPIRY_WARNING_DAYS * 86_400_000);

  const featuredActive = voyages.filter((v) => v.feature?.active);
  const dueForReview = featuredActive.filter(
    (v) => v.feature?.reviewOn !== null && v.feature!.reviewOn! <= today
  );
  const expiringSoon = featuredActive.filter(
    (v) =>
      v.feature?.hardExpiresAt && new Date(v.feature.hardExpiresAt) <= soon
  );
  const readyNotFeatured = voyages
    .filter((v) => !v.feature?.active && blockersFor(v).length === 0)
    .slice(0, CANDIDATE_CAP);
  const homepageEmpty = featuredActive.length === 0;

  const hasSomethingToReport =
    dueForReview.length > 0 ||
    expiringSoon.length > 0 ||
    readyNotFeatured.length > 0 ||
    homepageEmpty;

  if (!hasSomethingToReport) {
    return NextResponse.json({ sent: false, reason: "nothing to review" });
  }

  const listItem = (title: string, sub: string) =>
    `<li style="margin:0 0 8px 0"><strong>${escapeHtml(title)}</strong><br><span style="color:#607d99;font-size:13px">${sub}</span></li>`;

  const sections: string[] = [];

  if (homepageEmpty) {
    sections.push(
      `<p style="color:#b78b42"><strong>Nothing is currently featured on the homepage.</strong> The site is showing legacy journeys only.</p>`
    );
  }

  if (dueForReview.length > 0) {
    sections.push(`
      <h3>Due for review (${dueForReview.length})</h3>
      <ul style="padding-left:18px">
        ${dueForReview
          .map((v) =>
            listItem(
              `${v.officialVoyageTitle} — ${v.ship}`,
              `Featured ${v.feature?.featuredAt ? new Date(v.feature.featuredAt).toLocaleDateString("en-US") : "—"}, review was due ${v.feature?.reviewOn ?? "—"}`
            )
          )
          .join("")}
      </ul>
    `);
  }

  if (expiringSoon.length > 0) {
    sections.push(`
      <h3>Expiring within ${EXPIRY_WARNING_DAYS} days (${expiringSoon.length})</h3>
      <ul style="padding-left:18px">
        ${expiringSoon
          .map((v) =>
            listItem(
              `${v.officialVoyageTitle} — ${v.ship}`,
              `Hard expiry ${v.feature?.hardExpiresAt ? new Date(v.feature.hardExpiresAt).toLocaleDateString("en-US") : "—"}`
            )
          )
          .join("")}
      </ul>
    `);
  }

  if (readyNotFeatured.length > 0) {
    sections.push(`
      <h3>Ready to feature, not yet on the site (${readyNotFeatured.length}${voyages.filter((v) => !v.feature?.active && blockersFor(v).length === 0).length > CANDIDATE_CAP ? "+" : ""})</h3>
      <ul style="padding-left:18px">
        ${readyNotFeatured
          .map((v) => {
            const cheapest = v.offers.find((o) => o.websiteApproved) ?? v.offers[0];
            return listItem(
              `${v.officialVoyageTitle} — ${v.ship}`,
              `${cheapest ? `from ${money(cheapest.myPrice)} · ` : ""}quoted ${v.quotedAt ? new Date(v.quotedAt).toLocaleDateString("en-US") : "—"}`
            );
          })
          .join("")}
      </ul>
    `);
  }

  const html = `
    <div style="font-family:Georgia,serif;color:#223e67;max-width:560px">
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b78b42">Weekly · Quote Curation</p>
      <h2 style="color:#1b3154;font-weight:normal">What the homepage needs</h2>
      ${sections.join("")}
      <p style="margin-top:24px">
        <a href="${deskUrl}" style="background:#1b3154;color:#f6f1e8;text-decoration:none;padding:12px 24px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;display:inline-block">
          Open the curation desk
        </a>
      </p>
    </div>
  `;

  if (!process.env.RESEND_API_KEY) {
    console.error("Curation digest: RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "RESEND_API_KEY is not set" },
      { status: 500 }
    );
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error: sendError } = await resend.emails.send({
    from: process.env.DIGEST_FROM_EMAIL ?? "onboarding@resend.dev",
    to: ["jordan.yates@luxurycruiseconnections.com"],
    subject: homepageEmpty
      ? "Nothing is featured on the homepage right now"
      : `${dueForReview.length + readyNotFeatured.length} sailing${dueForReview.length + readyNotFeatured.length === 1 ? "" : "s"} worth a look`,
    html,
  });

  if (sendError) {
    console.error("Curation digest send failed:", sendError);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }

  return NextResponse.json({
    sent: true,
    dueForReview: dueForReview.length,
    expiringSoon: expiringSoon.length,
    readyNotFeatured: readyNotFeatured.length,
    homepageEmpty,
  });
}
