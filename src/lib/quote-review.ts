/**
 * Review-only warnings for suggested quote links. Never authorize a link or outreach.
 * Keep identity evidence on the server; return only booleans to the UI.
 */
export type QuoteReviewEvidence = {
  pipelineId: string;
  quotePackageId: string;
  matchMethod: "exact_email" | "name_only";
  pipelineName: string | null;
  quoteName: string | null;
};

export type QuoteReviewFlags = {
  differentRecordedNames: boolean;
  quoteMatchesMultiplePipelineRecords: boolean;
};

function normalizeName(name: string | null): string {
  return (name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function assessQuoteReviewRisks(
  matches: readonly QuoteReviewEvidence[]
): QuoteReviewFlags[] {
  const quoteToPipelines = new Map<string, Set<string>>();
  for (const match of matches) {
    const ids = quoteToPipelines.get(match.quotePackageId) ?? new Set<string>();
    ids.add(match.pipelineId);
    quoteToPipelines.set(match.quotePackageId, ids);
  }

  return matches.map((match) => {
    const pipelineName = normalizeName(match.pipelineName);
    const quoteName = normalizeName(match.quoteName);
    return {
      // Shared family inboxes and changed names are common; flag, don't reject.
      differentRecordedNames:
        match.matchMethod === "exact_email" &&
        !!pipelineName &&
        !!quoteName &&
        pipelineName !== quoteName,
      // A quote matching two different pipeline IDs must not be silently linked.
      quoteMatchesMultiplePipelineRecords:
        (quoteToPipelines.get(match.quotePackageId)?.size ?? 0) > 1,
    };
  });
}
