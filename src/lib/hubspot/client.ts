import "server-only";

/**
 * HubSpot CRM sync — the ownership play.
 *
 * The instant a visitor identifies (quote request or dispatch signup) we push
 * them into Jordan's own HubSpot, so the contact is his before the host agency
 * can reach out. Idempotent upsert keyed on email (no duplicate contacts on
 * re-submit), plus a Note carrying the normalized interest signal + message.
 *
 * Two transports, auto-selected at call time:
 *
 *   1. Forms Submissions API (preferred). Requires no authentication at all —
 *      just a portal ID and a form GUID, both readable off any form's embed
 *      code. This exists because the portal belongs to the host agency and
 *      Jordan holds an ordinary seat: creating a private app requires Super
 *      Admin, which he does not have. Do not "simplify" this path away — it is
 *      the only one that actually works today.
 *   2. CRM v3 with a private-app token. Richer (it can attach a Note), and a
 *      valid upgrade route if Jordan is ever granted Super Admin, so it stays.
 *
 * No-ops with a warning until one of those is configured — identical posture
 * to src/lib/email/send.ts, so this ships inert and goes live the moment the
 * environment is filled in, no code change.
 */

const HUBSPOT_BASE = "https://api.hubapi.com";
const HUBSPOT_FORMS_BASE = "https://api.hsforms.com";

// Mirrors the BASE constant in src/app/actions.ts. Deliberately re-declared:
// that module is "use server" and may only export async functions.
const SITE_BASE = "https://www.bonvtravelcompany.com";

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
 * Everything we know about the lead, folded into one readable block.
 *
 * The Forms path can only write HubSpot's *default* contact properties —
 * creating custom ones may need permissions Jordan doesn't have either — so
 * the source label, the normalized interest signal and the visitor's own words
 * all share the single built-in `message` field. Lines whose source value is
 * absent are dropped rather than rendered empty.
 */
function composeMessage(input: HubspotContactInput): string {
  return [
    `Source: ${input.source}`,
    input.interestSummary ? `Interest: ${input.interestSummary}` : null,
    input.message ? `\nMessage:\n${input.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Transport 1: Forms Submissions API. No auth header, no scopes, no admin —
 * HubSpot creates-or-updates a contact keyed on email (native dedupe), exactly
 * as if the visitor had filled in an embedded HubSpot form.
 */
async function submitViaForm(
  input: HubspotContactInput,
  portalId: string,
  formGuid: string
): Promise<boolean> {
  try {
    const { firstName, lastName } = splitName(input.name);

    // Only emit a field when it actually carries a value: HubSpot rejects a
    // submission naming a field the form doesn't have, and rejects a required
    // field submitted empty. Email is the dedupe key, so it's always present.
    const candidates: Array<[string, string | null | undefined]> = [
      ["email", input.email],
      ["firstname", firstName],
      ["lastname", lastName],
      ["phone", input.phone],
      ["message", composeMessage(input)],
    ];
    const fields = candidates
      .filter(([, value]) => Boolean(value))
      .map(([name, value]) => ({ name, value: value as string }));

    const res = await fetch(
      `${HUBSPOT_FORMS_BASE}/submissions/v3/integration/submit/${portalId}/${formGuid}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields,
          context: {
            pageUri: SITE_BASE,
            pageName: input.source,
          },
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error(
        `[hubspot] form submission failed (${res.status}): ${detail}`
      );
    }

    return true;
  } catch (err) {
    console.error("[hubspot] sync error:", err);
    return true;
  }
}

/**
 * Upsert the contact and attach a context note. Never throws — a CRM hiccup
 * must not turn a successful form submission into an error for the visitor.
 * Returns true if a live sync was attempted, false if it no-opped.
 *
 * Transport selection: Forms API if the portal/form pair is configured (the
 * no-admin path), else the private-app token, else no-op with a warning.
 */
export async function upsertContact(
  input: HubspotContactInput
): Promise<boolean> {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formGuid = process.env.HUBSPOT_FORM_GUID;
  if (portalId && formGuid) {
    return submitViaForm(input, portalId, formGuid);
  }

  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    console.warn(
      `[hubspot] no HUBSPOT_PORTAL_ID/HUBSPOT_FORM_GUID and no HUBSPOT_PRIVATE_APP_TOKEN — skipping sync for ${input.email} (${input.source})`
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
      await fetch(`${HUBSPOT_BASE}/crm/v3/objects/notes`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          properties: {
            hs_note_body: composeMessage(input),
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
