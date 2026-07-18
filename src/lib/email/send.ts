import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

// No sending subdomain is verified yet (see docs/email-marketing-architecture.md).
// Until RESEND_API_KEY is set, this logs instead of throwing so form
// submissions never fail because email delivery isn't configured.
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      `[email] RESEND_API_KEY or EMAIL_FROM not set — skipping send to ${input.to} ("${input.subject}")`
    );
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });

  if (error) {
    console.error("[email] Resend send failed:", error);
  }
}
