# Website-to-email content workflow

Use Supabase as the structured source of truth, the website as the full editorial destination, and HubSpot as the CRM and distribution layer.

## One journey, several marketing assets

For each published journey:

1. Maintain the complete offer in the canonical Supabase `journeys` record.
2. Publish the full journey page on the website.
3. Create a short HubSpot email teaser that links to the journey page.
4. Add UTM parameters to distinguish campaign, audience, and placement.
5. Use HubSpot click activity to segment follow-up audiences.

Example link:

```text
https://YOUR_DOMAIN/journeys/gems-of-the-danube-2026?utm_source=hubspot&utm_medium=email&utm_campaign=danube_september_2026&utm_content=primary_cta
```

## Suggested HubSpot email format

- Editorial subject line
- One strong image
- 80–150 words of context
- A short Jordan's Take
- One primary call to action leading to the website
- Optional secondary reply prompt

The website should hold the detailed itinerary, ship guidance, room information, pricing context, official links, and inquiry form. The email should create interest rather than duplicate the complete page.

## Recommended HubSpot properties later

Create these only after naming and reporting conventions are finalized:

- `latest_journey_interest`
- `latest_cruise_line_interest`
- `latest_region_interest`
- `website_lead_source`
- `last_marketing_campaign`

Do not add custom properties casually. Every property should support a real list, workflow, personalization rule, or report.
