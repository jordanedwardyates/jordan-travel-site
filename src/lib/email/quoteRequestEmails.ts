// Mirrors emails/transactional/quote-request-received.html and
// quote-request-internal-notify.html — keep both in sync if the brand
// treatment there changes.

import { sendEmail } from "./send";

export type QuoteRequestEmailData = {
  name: string;
  email: string;
  phone: string;
  journeyLabel: string | null;
  message: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderClientReceived(data: QuoteRequestEmailData): {
  subject: string;
  html: string;
} {
  const name = escapeHtml(data.name);
  const journeyLine = data.journeyLabel
    ? `Thank you for writing in about ${escapeHtml(data.journeyLabel)}. I read every`
    : `Thank you for writing in. I read every`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="x-apple-disable-message-reformatting">
<title>Your note has reached me — BON V: A Travel Company</title>
</head>
<body style="margin:0; padding:0; background-color:#e6ddd0; -webkit-text-size-adjust:100%;">

<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
  I read every note myself. Here's what happens next.
  &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#e6ddd0;">
  <tr>
    <td align="center" style="padding:28px 12px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background-color:#f6f1e8; border:1px solid #c9d6dc;">
        <tr>
          <td style="padding:6px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d8cdbb;">

              <tr>
                <td align="center" style="padding:40px 40px 0 40px; font-family:Georgia,'Times New Roman',serif;">
                  <span style="font-size:24px; color:#1b3154; letter-spacing:-0.3px;">BON V:</span>
                  <span style="font-size:17px; font-style:italic; color:#223e67;">&nbsp;A Travel Company</span>
                  <div style="margin:22px auto 0 auto; width:52px; height:2px; background-color:#b78b42; line-height:2px; font-size:0;">&nbsp;</div>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:26px 48px 8px 48px; font-family:Georgia,'Times New Roman',serif; color:#1b3154;">
                  <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:3px; color:#223e67;">RECEIVED</div>
                  <h1 style="margin:16px 0 0 0; font-size:28px; font-weight:normal; line-height:1.25; color:#1b3154;">Your note has reached me,<br>${name}.</h1>
                  <p style="margin:18px 0 0 0; font-size:17px; line-height:1.7; color:#223e67; text-align:left;">
                    ${journeyLine}
                    inquiry myself &mdash; no forms, no queue &mdash; and I&rsquo;ll reply
                    personally within one business day with fares, availability,
                    and a few thoughts on how to make the itinerary right.
                  </p>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:10px 48px 8px 48px;">
                  <p style="margin:0; font-size:14px; font-style:italic; line-height:1.6; color:#607d99;">
                    In the meantime, if anything else comes to mind &mdash; dates,
                    cabin preference, who&rsquo;s traveling &mdash; just reply to this
                    email. It comes straight to me.
                  </p>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding:22px 40px 8px 40px; font-family:Georgia,'Times New Roman',serif;">
                  <p style="margin:0; font-size:22px; font-style:italic; color:#223e67;">Jordan Yates</p>
                  <p style="margin:2px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; letter-spacing:2px; color:#8ea6b4;">LUXURY VOYAGE ADVISOR</p>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 40px 30px 40px;">
                  <div style="border-top:1px solid #c9d6dc; padding-top:18px; font-family:Arial,Helvetica,sans-serif; font-size:11px; line-height:1.7; color:#8ea6b4; text-align:center;">
                    BON V: A Travel Company &middot; in partnership with Luxury Cruise Connections<br>
                    [Mailing address] &middot; Jacksonville, FL &middot; Virtuoso member since 2011
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject: "Your note has reached me", html };
}

export function renderInternalNotify(data: QuoteRequestEmailData): {
  subject: string;
  html: string;
} {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const phone = data.phone ? escapeHtml(data.phone) : "Not provided";
  const journey = data.journeyLabel
    ? escapeHtml(data.journeyLabel)
    : "Not provided (general inquiry)";
  const message = escapeHtml(data.message).replace(/\n/g, "<br>");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>New quote request — ${name}</title>
</head>
<body style="margin:0; padding:0; background-color:#efe8dd; -webkit-text-size-adjust:100%;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#efe8dd;">
  <tr>
    <td align="center" style="padding:24px 12px;">

      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px; max-width:560px; background-color:#f6f1e8; border:1px solid #c9d6dc;">

        <tr>
          <td style="padding:20px 32px; font-family:Arial,Helvetica,sans-serif;">
            <div style="font-size:11px; letter-spacing:2px; color:#223e67;">NEW QUOTE REQUEST</div>
            <h1 style="margin:8px 0 0 0; font-family:Georgia,'Times New Roman',serif; font-size:22px; font-weight:normal; color:#1b3154;">${name}</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:0 32px 8px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#1b3154;">
              <tr>
                <td style="padding:8px 0; border-top:1px solid #d8cdbb; width:110px; color:#607d99;">Email</td>
                <td style="padding:8px 0; border-top:1px solid #d8cdbb;"><a href="mailto:${email}" style="color:#223e67;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:8px 0; border-top:1px solid #d8cdbb; color:#607d99;">Phone</td>
                <td style="padding:8px 0; border-top:1px solid #d8cdbb;">${phone}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; border-top:1px solid #d8cdbb; color:#607d99;">Journey</td>
                <td style="padding:8px 0; border-top:1px solid #d8cdbb;">${journey}</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:12px 32px 28px 32px;">
            <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:1px; color:#607d99; margin-bottom:6px;">MESSAGE</div>
            <div style="font-family:Georgia,'Times New Roman',serif; font-size:15px; line-height:1.6; color:#1b3154;">${message}</div>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 32px 24px 32px; border-top:1px solid #c9d6dc;">
            <a href="mailto:${email}" style="display:inline-block; background-color:#223e67; color:#f6f1e8; font-family:Arial,Helvetica,sans-serif; font-size:12px; letter-spacing:1px; text-decoration:none; padding:12px 24px;">REPLY TO ${name}</a>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject: `New quote request — ${data.name}`, html };
}

// Fires both emails for a new quote request. Never throws — a delivery
// failure here should not turn a successful form submission into an error
// for the client.
export async function notifyQuoteRequest(
  data: QuoteRequestEmailData
): Promise<void> {
  const internalTo =
    process.env.INTERNAL_NOTIFY_EMAIL ?? "jordan.yates@luxurycruiseconnections.com";

  const client = renderClientReceived(data);
  const internal = renderInternalNotify(data);

  await Promise.allSettled([
    sendEmail({ to: data.email, subject: client.subject, html: client.html }),
    sendEmail({
      to: internalTo,
      subject: internal.subject,
      html: internal.html,
      replyTo: data.email,
    }),
  ]);
}
