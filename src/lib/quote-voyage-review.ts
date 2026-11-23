/**
 * Structured sailing evidence for historical quote candidates.
 *
 * Identity matches do NOT establish that two records concern the same voyage.
 * These flags are for manual review only and must never approve a database link,
 * supplier availability claim, or client outreach.
 */
export type LinkedQuoteVoyage = {
  id: string;
  embarkation_date: string | null;
};

export type QuoteVoyageReview = {
  linkedVoyageCount: number;
  noStructuredVoyageData: boolean;
  allLinkedDeparturesPast: boolean;
  pipelineDateNotInQuote: boolean;
  pipelineYearNotInQuote: boolean;
};

function validDay(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(value + "T00:00:00Z");
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp).toISOString().slice(0, 10) === value ? value : null;
}

/**
 * Only flag contradictions when every distinct linked voyage has a valid date.
 * A multi-option quote is NOT a single booking; any matching option prevents
 * a date-mismatch warning. Missing structured data remains explicitly visible.
 */
export function assessQuoteVoyageReview(
  pipelineSailDate: string | null,
  pipelineSailing: string | null,
  linkedVoyages: readonly LinkedQuoteVoyage[],
  todayISO: string
): QuoteVoyageReview {
  const today = validDay(todayISO);
  if (!today) throw new Error("Quote voyage review requires a valid Eastern calendar date");

  const unique = new Map<string, string | null>();
  for (const voyage of linkedVoyages) {
    if (!unique.has(voyage.id)) unique.set(voyage.id, validDay(voyage.embarkation_date));
  }

  const linkedVoyageCount = unique.size;
  const dates = [...unique.values()];
  const allDated = linkedVoyageCount > 0 && dates.every((date) => date !== null);
  const knownDates = dates.filter((date): date is string => date !== null);
  const pipelineDate = validDay(pipelineSailDate);

  // Use a year in free-form sailing text only if exactly one distinct year is
  // present. "2026 options, reset for 2027" is ambiguous and is NOT a conflict.
  const mentionedYears = new Set((pipelineSailing ?? "").match(/\b20\d{2}\b/g) ?? []);
  const soleYear = mentionedYears.size === 1 ? [...mentionedYears][0] : null;

  return {
    linkedVoyageCount,
    noStructuredVoyageData: linkedVoyageCount === 0,
    allLinkedDeparturesPast: allDated && knownDates.every((date) => date < today),
    pipelineDateNotInQuote:
      allDated && pipelineDate !== null && !knownDates.includes(pipelineDate),
    pipelineYearNotInQuote:
      allDated && soleYear !== null && knownDates.every((date) => !date.startsWith(soleYear)),
  };
}
