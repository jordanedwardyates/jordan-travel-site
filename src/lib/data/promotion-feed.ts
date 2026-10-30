import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Internal promotion-feed health only. "trusted" means an archived source was
 * accepted, NOT that a supplier has reconfirmed the fare or cabin inventory.
 * Never use this metric to authorize automated client outreach.
 */
export type PromotionFeedHealth = {
  totalOffers: number;
  recordedLast30Days: number;
  trustedRecordedLast30Days: number;
  latestQuotedAt: string | null;
};

export async function getPromotionFeedHealth(): Promise<PromotionFeedHealth> {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [all, recent, trustedRecent, latest] = await Promise.all([
    supabase.from("price_offers").select("id", { count: "exact", head: true }),
    supabase.from("price_offers").select("id", { count: "exact", head: true })
      .gte("quoted_at", cutoff),
    supabase.from("price_offers").select("id", { count: "exact", head: true })
      .eq("source_status", "trusted")
      .gte("quoted_at", cutoff),
    supabase.from("price_offers").select("quoted_at")
      .not("quoted_at", "is", null)
      .order("quoted_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  for (const result of [all, recent, trustedRecent, latest]) {
    if (result.error) {
      throw new Error("Promotion feed health is unavailable");
    }
  }

  return {
    totalOffers: all.count ?? 0,
    recordedLast30Days: recent.count ?? 0,
    trustedRecordedLast30Days: trustedRecent.count ?? 0,
    latestQuotedAt: latest.data?.quoted_at ?? null,
  };
}
