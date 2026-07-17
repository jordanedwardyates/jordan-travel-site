# Deployment checklist

## Before merge

- Run `npm run lint` locally.
- Run `npm run build` locally.
- Confirm `Gems of the Danube` appears from the Supabase `journeys` table.
- Submit one test quote request.
- Submit one newsletter signup.
- Confirm both Supabase rows are created.

## Vercel environment variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` when required by server-only features

Optional HubSpot integration:

- `HUBSPOT_PRIVATE_APP_TOKEN`
- `HUBSPOT_SUBSCRIPTION_TYPE_ID`

Add variables to Preview first, redeploy the feature branch, and test. Add them to Production only after the preview succeeds.

## Production verification

- Homepage loads without console or server errors.
- Published journeys display in the intended order.
- Unpublished journeys remain hidden.
- Journey links resolve correctly.
- Quote requests save to Supabase and appear in HubSpot when configured.
- Newsletter signups save to Supabase and receive the correct HubSpot subscription status when configured.
- Mobile layout is readable on iPhone Safari.
- Phone, email, privacy, and official cruise links work.
