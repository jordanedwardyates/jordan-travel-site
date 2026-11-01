import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { matchQuoteIdentity, type QuoteMatchMethod } from "@/lib/quote-match";
import { assessQuoteReviewRisks, type QuoteReviewEvidence, type QuoteReviewFlags } from "@/lib/quote-review";
import { assessQuoteVoyageReview, type LinkedQuoteVoyage, type QuoteVoyageReview } from "@/lib/quote-voyage-review";

/**
 * Suggested quote links, NOT confirmed client/voyage relationships.
 *
 * Rules:
 * - Exact nonempty email is the strongest available identifier.
 * - Exact normalized name is a REVIEW-ONLY suggestion if either email is absent.
 * - Two different, populated emails veto a name match.
 * - A name match NEVER updates sales_pipeline.quote_package_id.
 * - A package can represent a different voyage for the same person.
 * - No email addresses or source notes are returned to the page.
 */
export type QuoteLinkCandidate = {
  pipelineId: string;
  clientName: string;
  pipelineSailing: string | null;
  pipelineSailDate: string | null;
  quotePackageId: string;
  quoteTitle: string;
  quotedAt: string | null;
  matchMethod: QuoteMatchMethod;
} & QuoteReviewFlags & QuoteVoyageReview;

type PipelineRow = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  sailing: string | null;
  sail_date: string | null;
  quote_package_id: string | null;
};

type PackageRow = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  title: string | null;
  quoted_at: string | null;
};

type QuoteItemRow = { quote_package_id: string; price_offer_id: string | null };
type OfferRow = { id: string; accommodation_id: string | null };
type AccommodationRow = { id: string; voyage_id: string | null };

const MAX_ROWS_PER_SOURCE = 1000;

export async function listQuoteLinkCandidates(todayISO: string): Promise<QuoteLinkCandidate[]> {
  const supabase = createAdminClient();
  const [pipelineResult, quoteResult, quoteItemsResult, offersResult, accommodationsResult, voyageResult] = await Promise.all([
    supabase
      .from("sales_pipeline")
      .select("id,client_name,client_email,sailing,sail_date,quote_package_id")
      .order("id", { ascending: true })
      .limit(MAX_ROWS_PER_SOURCE + 1),
    supabase
      .from("quote_packages")
      .select("id,client_name,client_email,title,quoted_at")
      .order("id", { ascending: true })
      .limit(MAX_ROWS_PER_SOURCE + 1),
    // Trace normalized quote items through offers and accommodations to
    // actual voyage records; do not infer a sailing from a quote title.
    supabase.from("quote_items").select("quote_package_id,price_offer_id")
      .order("id", { ascending: true }).limit(MAX_ROWS_PER_SOURCE + 1),
    supabase.from("price_offers").select("id,accommodation_id")
      .order("id", { ascending: true }).limit(MAX_ROWS_PER_SOURCE + 1),
    supabase.from("accommodations").select("id,voyage_id")
      .order("id", { ascending: true }).limit(MAX_ROWS_PER_SOURCE + 1),
    supabase.from("voyages").select("id,embarkation_date")
      .order("id", { ascending: true }).limit(MAX_ROWS_PER_SOURCE + 1),
  ]);

  if ([pipelineResult, quoteResult, quoteItemsResult, offersResult, accommodationsResult, voyageResult].some((result) => result.error)) {
    throw new Error("Quote reconciliation is unavailable");
  }

  const pipelineRows = (pipelineResult.data ?? []) as PipelineRow[];
  const quoteRows = (quoteResult.data ?? []) as PackageRow[];
  const quoteItemRows = (quoteItemsResult.data ?? []) as QuoteItemRow[];
  const offerRows = (offersResult.data ?? []) as OfferRow[];
  const accommodationRows = (accommodationsResult.data ?? []) as AccommodationRow[];
  const voyageRows = (voyageResult.data ?? []) as LinkedQuoteVoyage[];
  if (
    pipelineRows.length > MAX_ROWS_PER_SOURCE ||
    quoteRows.length > MAX_ROWS_PER_SOURCE ||
    quoteItemRows.length > MAX_ROWS_PER_SOURCE ||
    offerRows.length > MAX_ROWS_PER_SOURCE ||
    accommodationRows.length > MAX_ROWS_PER_SOURCE ||
    voyageRows.length > MAX_ROWS_PER_SOURCE
  ) {
    // Never present an incomplete reconciliation as exhaustive.
    throw new Error("Quote reconciliation exceeded its review limit");
  }

  const offersById = new Map(offerRows.map((row) => [row.id, row]));
  const accommodationsById = new Map(accommodationRows.map((row) => [row.id, row]));
  const voyagesById = new Map(voyageRows.map((row) => [row.id, row]));
  const voyagesByPackage = new Map<string, LinkedQuoteVoyage[]>();
  for (const row of quoteItemRows) {
    const offer = offersById.get(row.price_offer_id ?? "");
    const accommodation = accommodationsById.get(offer?.accommodation_id ?? "");
    const voyage = voyagesById.get(accommodation?.voyage_id ?? "");
    if (!voyage) continue;
    const voyages = voyagesByPackage.get(row.quote_package_id) ?? [];
    voyages.push(voyage);
    voyagesByPackage.set(row.quote_package_id, voyages);
  }

  const candidates: Omit<QuoteLinkCandidate, keyof QuoteReviewFlags | keyof QuoteVoyageReview>[] = [];
  const evidence: QuoteReviewEvidence[] = [];
  for (const pipeline of pipelineRows) {
    // Already linked records are excluded from the unresolved review queue.
    if (pipeline.quote_package_id) continue;
    for (const quote of quoteRows) {
      const method = matchQuoteIdentity(pipeline, quote);
      if (!method) continue;
      candidates.push({
        pipelineId: pipeline.id,
        clientName: pipeline.client_name?.trim() || "Unresolved client",
        pipelineSailing: pipeline.sailing,
        pipelineSailDate: pipeline.sail_date,
        quotePackageId: quote.id,
        quoteTitle: quote.title?.trim() || "Untitled quote package",
        quotedAt: quote.quoted_at,
        matchMethod: method,
      });
      evidence.push({
        pipelineId: pipeline.id,
        quotePackageId: quote.id,
        matchMethod: method,
        pipelineName: pipeline.client_name,
        quoteName: quote.client_name,
      });
    }
  }

  // Compute warnings server-side; no identity evidence is returned to the page.
  const risks = assessQuoteReviewRisks(evidence);
  return candidates.map((candidate, index) => ({
    ...candidate,
    ...risks[index],
    ...assessQuoteVoyageReview(
      candidate.pipelineSailDate,
      candidate.pipelineSailing,
      voyagesByPackage.get(candidate.quotePackageId) ?? [],
      todayISO
    ),
  })).sort(
    (a, b) =>
      a.clientName.localeCompare(b.clientName) ||
      (a.matchMethod === b.matchMethod
        ? 0
        : a.matchMethod === "exact_email" ? -1 : 1) ||
      a.quotePackageId.localeCompare(b.quotePackageId)
  );
}
