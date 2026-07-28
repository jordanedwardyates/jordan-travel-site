import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Quote log + inbound inquiry reads. Internal/server-side only — service-
 * role client, so this sees everything regardless of RLS. Sibling to
 * campaigns.ts, which stays scoped to Dispatch campaign performance.
 */

export type QuotePackage = {
  id: string;
  title: string;
  clientName: string | null;
  clientEmail: string | null;
  status: "draft" | "sent" | "accepted" | "declined" | "expired" | "archived";
  sourceSystem: string | null;
  quotedAt: string | null;
  createdAt: string;
  notes: string | null;
};

export type QuoteStatusCounts = Record<QuotePackage["status"], number>;

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapQuotePackage(r: any): QuotePackage {
  return {
    id: r.id,
    title: r.title,
    clientName: r.client_name,
    clientEmail: r.client_email,
    status: r.status,
    sourceSystem: r.source_system,
    quotedAt: r.quoted_at,
    createdAt: r.created_at,
    notes: r.notes,
  };
}

/** Every quote package (sent, draft, accepted, etc.), newest first. */
export async function listQuotePackages(): Promise<QuotePackage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quote_packages")
    .select("*")
    .order("quoted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapQuotePackage);
}

const EMPTY_STATUS_COUNTS: QuoteStatusCounts = {
  draft: 0,
  sent: 0,
  accepted: 0,
  declined: 0,
  expired: 0,
  archived: 0,
};

/** Roll a fetched quote list up by status — no separate round trip. */
export function countQuotePackagesByStatus(
  quotes: QuotePackage[]
): QuoteStatusCounts {
  return quotes.reduce(
    (counts, q) => ({ ...counts, [q.status]: counts[q.status] + 1 }),
    { ...EMPTY_STATUS_COUNTS }
  );
}

export type QuoteRequest = {
  id: string;
  name: string;
  email: string;
  journeyLabel: string | null;
  message: string;
  status: string;
  createdAt: string;
  sourceCampaignId: string | null;
  sourceCampaignTitle: string | null;
  voyageId: string | null;
};

function mapQuoteRequest(r: any): QuoteRequest {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    journeyLabel: r.journey_label,
    message: r.message,
    status: r.status,
    createdAt: r.created_at,
    sourceCampaignId: r.source_campaign_id,
    sourceCampaignTitle: r.campaigns?.title ?? null,
    voyageId: r.voyage_id,
  };
}

/** Every inbound site inquiry, newest first, with its source campaign's title (if any). */
export async function listQuoteRequests(): Promise<QuoteRequest[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*, campaigns(title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapQuoteRequest);
}
