import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Dispatch campaign performance reads. Internal/server-side only — these
 * hit the campaign_stats and campaign_sailing_stats views via the
 * service-role client, so they see everything regardless of RLS.
 */

export type CampaignStats = {
  campaignId: string;
  campaignNumber: number;
  slug: string;
  title: string;
  subject: string | null;
  status: "draft" | "scheduled" | "sent" | "archived";
  sentAt: string | null;
  segment: string | null;
  audienceSize: number | null;
  delivered: number;
  opened: number;
  clicked: number;
  totalClicks: number;
  bounced: number;
  unsubscribed: number;
  quoteRequests: number;
};

export type SailingStats = {
  campaignId: string;
  voyageId: string;
  position: number;
  section: string | null;
  utmContent: string | null;
  leadFare: number | null;
  leadSavings: number | null;
  ship: string;
  voyageTitle: string;
  embarkationDate: string | null;
  embarkPort: string | null;
  disembarkPort: string | null;
  officialUrl: string | null;
  clicks: number;
  uniqueClickers: number;
  quoteRequests: number;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const num = (v: any) => (v === null || v === undefined ? 0 : Number(v));

function mapCampaign(r: any): CampaignStats {
  return {
    campaignId: r.campaign_id,
    campaignNumber: r.campaign_number,
    slug: r.slug,
    title: r.title,
    subject: r.subject,
    status: r.status,
    sentAt: r.sent_at,
    segment: r.segment,
    audienceSize: r.audience_size === null ? null : Number(r.audience_size),
    delivered: num(r.delivered),
    opened: num(r.opened),
    clicked: num(r.clicked),
    totalClicks: num(r.total_clicks),
    bounced: num(r.bounced),
    unsubscribed: num(r.unsubscribed),
    quoteRequests: num(r.quote_requests),
  };
}

function mapSailing(r: any): SailingStats {
  return {
    campaignId: r.campaign_id,
    voyageId: r.voyage_id,
    position: r.position,
    section: r.section,
    utmContent: r.utm_content,
    leadFare: r.lead_fare === null ? null : Number(r.lead_fare),
    leadSavings: r.lead_savings === null ? null : Number(r.lead_savings),
    ship: r.ship,
    voyageTitle: r.official_voyage_title,
    embarkationDate: r.embarkation_date,
    embarkPort: r.embark_port,
    disembarkPort: r.disembark_port,
    officialUrl: r.official_url,
    clicks: num(r.clicks),
    uniqueClickers: num(r.unique_clickers),
    quoteRequests: num(r.quote_requests),
  };
}

/** Every campaign with its de-duplicated engagement rollup, newest first. */
export async function listCampaignStats(): Promise<CampaignStats[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("campaign_stats")
    .select("*")
    .order("campaign_number", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapCampaign);
}

/** Sailing leaderboard across all campaigns, ordered by campaign position. */
export async function listSailingStats(): Promise<SailingStats[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("campaign_sailing_stats")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapSailing);
}

/** Total Dispatch subscribers — the denominator for reach. */
export async function countSubscribers(): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}
