import "server-only";

/**
 * HubSpot CRM sync — the ownership play.
 *
 * The instant a visitor identifies (quote request or dispatch signup) we push
 * them into Jordan's own HubSpot, so the contact is his before the host agency
 * can reach out. Idempotent upsert keyed on email (no duplicate contacts on
 * re-submit), plus a Note carrying the normalized interest signal + message.
 *
 * No-ops with a warning until HUBSPOT_PRIVATE_APP_TOKEN is set — identical
 * posture to src/lib/email/send.ts, so this ships inert and goes live the
 * moment the token lands in the environment, no code change.
 */

const HUBSPOT_BASE = "https://api.hubapi.com";

export type HubspotContactInput = {
  email: string;
  /** Full name, split into first/last for HubSpot's standard properties. */
  name?: string | null;
  phone?: string | null;
  /** "Website quote request" / "STAMPED signup". */
  source: string;
  /** One-line normalized interest, e.g. "Mediterranean · Autumn · $5k–$10k". */
  interestSummary?: string | null;
  /** The visitor's own words, if any (quote message). */
  message?: string | null;
};

function splitName(
  full: string | null | undefined
): { firstName: string | null; lastName: string | null } {
  if (!full) return { firstName: null, lastName: null };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

/**
 * Upsert the contact and attach a context note. Never throws — a CRM hiccup
 * must not turn a successful form submission into an error for the visitor.
 * Returns true if a live sync was attempted, false if it no-opped.
 */
export async function upsertContact(
  input: HubspotContactInput
): Promise<boolean> {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    console.warn(
      `[hubspot] HUBSPOT_PRIVATE_APP_TOKEN not set — skipping sync for ${input.email} (${input.source})`
    );
    return false;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const { firstName, lastName } = splitName(input.name);

    const properties: Record<string, string> = { email: input.email };
    if (firstName) properties.firstname = firstName;
    if (lastName) properties.lastname = lastName;
    if (input.phone) properties.phone = input.phone;

    // Idempotent upsert keyed on email — no duplicate contacts on re-submit.
    const upsertRes = await fetch(
      `${HUBSPOT_BASE}/crm/v3/objects/contacts/batch/upsert`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          inputs: [{ idProperty: "email", id: input.email, properties }],
        }),
      }
    );

    if (!upsertRes.ok) {
      const detail = await upsertRes.text();
      console.error(
        `[hubspot] contact upsert failed (${upsertRes.status}): ${detail}`
      );
      return true;
    }

    const upsertBody = (await upsertRes.json()) as {
      results?: Array<{ id?: string }>;
    };
    const contactId = upsertBody.results?.[0]?.id;

    // Attach the interest + message as a Note, so no custom properties need to
    // exist in Jordan's portal for this to be useful on day one.
    if (contactId) {
      const noteLines = [
        `Source: ${input.source}`,
        input.interestSummary ? `Interest: ${input.interestSummary}` : null,
        input.message ? `\nMessage:\n${input.message}` : null,
      ].filter(Boolean);

      await fetch(`${HUBSPOT_BASE}/crm/v3/objects/notes`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          properties: {
            hs_note_body: noteLines.join("\n"),
            hs_timestamp: new Date().toISOString(),
          },
          associations: [
            {
              to: { id: contactId },
              types: [
                {
                  associationCategory: "HUBSPOT_DEFINED",
                  associationTypeId: 202, // note → contact
                },
              ],
            },
          ],
        }),
      });
    }

    return true;
  } catch (err) {
    console.error("[hubspot] sync error:", err);
    return true;
  }
}
