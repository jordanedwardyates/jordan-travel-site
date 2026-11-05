/**
 * Pure, conservative identity heuristic for quote-reconciliation suggestions.
 * NEVER use this function to auto-link clients or trigger outreach.
 */
export type QuoteMatchMethod = "exact_email" | "name_only";

export type QuoteIdentity = {
  client_name: string | null;
  client_email: string | null;
};

function normalizeEmail(value: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function normalizeName(value: string | null): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function matchQuoteIdentity(
  pipeline: QuoteIdentity,
  quote: QuoteIdentity
): QuoteMatchMethod | null {
  const pipelineEmail = normalizeEmail(pipeline.client_email);
  const quoteEmail = normalizeEmail(quote.client_email);

  // Both known emails: mismatches veto any name similarity.
  if (pipelineEmail && quoteEmail) {
    return pipelineEmail === quoteEmail ? "exact_email" : null;
  }

  // With missing email, require full normalized name equality.
  const pipelineName = normalizeName(pipeline.client_name);
  const quoteName = normalizeName(quote.client_name);
  // Single-word first names and placeholder labels are not reliable identities.
  // These still need manual research, but must not appear as suggested links.
  const isUsableFullName = (name: string) =>
    name.split(" ").length >= 2 &&
    !["unknown client", "unresolved client", "not recorded", "tbd client", "test client"].includes(name);
  return pipelineName === quoteName && isUsableFullName(pipelineName) ? "name_only" : null;
}
