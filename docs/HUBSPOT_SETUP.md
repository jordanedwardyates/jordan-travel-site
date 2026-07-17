# HubSpot setup

The website always saves quote requests and newsletter signups to Supabase first. HubSpot sync is optional and failure-safe: if HubSpot is unavailable, the visitor still receives a successful submission and the Supabase record remains intact.

## 1. Create a HubSpot private app

In HubSpot, create a private app with these scopes:

- `crm.objects.contacts.write`
- `subscriptions-status-write`

Copy the private app token into your local `.env.local` and your Vercel project environment variables as:

```bash
HUBSPOT_PRIVATE_APP_TOKEN=
```

Never commit the real token.

## 2. Find the newsletter subscription type ID

Use the HubSpot email subscription type that should receive **STAMPED: The Weekly Edit** signups. Add its numeric ID as:

```bash
HUBSPOT_SUBSCRIPTION_TYPE_ID=
```

Without this value, contacts are still created or updated in HubSpot CRM, but they are not opted into a marketing-email subscription type.

## 3. Behavior

- Quote requests are upserted as HubSpot contacts by email.
- Newsletter signups are upserted as contacts and, when the subscription type ID is configured, marked subscribed with explicit website-form consent.
- Existing opt-outs are respected by HubSpot.
- Supabase remains the source of truth for website submissions.

## 4. Test before production

1. Submit a quote using a test email address.
2. Confirm the row appears in Supabase `quote_requests`.
3. Confirm the contact appears in HubSpot.
4. Submit the newsletter form with a second test address.
5. Confirm the row appears in Supabase `subscribers`.
6. Confirm the HubSpot contact has the intended email subscription status.
7. Review Vercel function logs for any HubSpot API errors.
