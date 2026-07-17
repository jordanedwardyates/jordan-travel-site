type HubSpotContactInput = {
  email: string;
  name?: string;
  phone?: string;
};

const HUBSPOT_BASE_URL = "https://api.hubapi.com";

function splitName(name?: string): { firstname?: string; lastname?: string } {
  if (!name) return {};
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstname: parts[0] };
  return {
    firstname: parts[0],
    lastname: parts.slice(1).join(" "),
  };
}

async function hubSpotRequest(path: string, body: unknown): Promise<void> {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) return;

  const response = await fetch(`${HUBSPOT_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`HubSpot request failed (${response.status}): ${detail}`);
  }
}

/**
 * Create or update one HubSpot CRM contact by email.
 * This is intentionally optional: without HUBSPOT_PRIVATE_APP_TOKEN, Supabase
 * remains the source of truth and form submissions continue to work normally.
 */
export async function upsertHubSpotContact({
  email,
  name,
  phone,
}: HubSpotContactInput): Promise<void> {
  const { firstname, lastname } = splitName(name);
  const properties: Record<string, string> = {};
  if (firstname) properties.firstname = firstname;
  if (lastname) properties.lastname = lastname;
  if (phone) properties.phone = phone;

  await hubSpotRequest("/crm/objects/2026-03/contacts/batch/upsert", {
    inputs: [
      {
        id: email,
        idProperty: "email",
        properties,
      },
    ],
  });
}

/**
 * Opt an email into the configured HubSpot subscription type.
 * Only runs when both the private-app token and subscription type ID exist.
 * The website form is an explicit subscription request, so consent is recorded
 * as CONSENT_WITH_NOTICE. HubSpot will not override a prior opt-out.
 */
export async function subscribeHubSpotEmail(email: string): Promise<void> {
  const subscriptionId = process.env.HUBSPOT_SUBSCRIPTION_TYPE_ID;
  if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN || !subscriptionId) return;

  await hubSpotRequest("/communication-preferences/2026-03/statuses/batch/write", {
    inputs: [
      {
        subscriptionId: Number(subscriptionId),
        statusState: "SUBSCRIBED",
        legalBasis: "CONSENT_WITH_NOTICE",
        legalBasisExplanation:
          "Contact explicitly requested the STAMPED: The Weekly Edit email on the website signup form.",
        channel: "EMAIL",
        subscriberIdString: email,
      },
    ],
  });
}
