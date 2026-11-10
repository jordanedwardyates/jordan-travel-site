/**
 * Promotion eligibility evaluator. Pure, read-only, and intentionally conservative.
 * No client records, prices, or supplier availability are fetched here.
 * This module NEVER authorizes outreach.
 */
export function evaluatePromotionEligibility({ client, quote, promotion, now = new Date() }) {
  const reasons = [];
  const warnings = [];
  const hold = (decision, message, lane = "prospect_review") => ({
    decision, lane, score: null, reasons, warnings: [...warnings, message],
    outreach_allowed: false, advisor_status: "needs_review"
  });
  if (!client?.id || !quote?.verified_client_id || client.id !== quote.verified_client_id)
    return hold("HOLD_IDENTITY", "Verified client-to-quote linkage is required");
  if (!["prospect", "booked"].includes(client.lifecycle))
    return hold("HOLD_LIFECYCLE", "Client lifecycle must be verified");
  const lane = client.lifecycle === "booked" ? "service_reprice" : "prospect_review";
  if (!promotion?.official_source_url || !/^https:\/\//i.test(promotion.official_source_url)
      || !promotion.valid_from || !promotion.valid_through)
    return hold("HOLD_SOURCE", "Official HTTPS source and validity dates required", lane);
  // Date-only validity represents whole supplier-local calendar days, not midnight UTC.
  // Until supplier timezone is known, use UTC calendar dates conservatively and
  // require explicit timestamps for intraday deadlines.
  const validityInstant = (value, endOfDay) => {
    if (typeof value !== "string") return NaN;
    const dayOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const instant = Date.parse(dayOnly ? `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z` : value);
    return Number.isFinite(instant) ? instant : NaN;
  };
  const from = validityInstant(promotion.valid_from, false);
  const through = validityInstant(promotion.valid_through, true);
  const checkedAt = new Date(now).getTime();
  if (![from, through, checkedAt].every(Number.isFinite) || from > through)
    return hold("HOLD_SOURCE", "Invalid promotion validity dates", lane);
  if (checkedAt < from || checkedAt > through || !promotion.inventory_verified_for_exact_sailing)
    return hold("VERIFY_SUPPLIER", "Promotion validity or exact sailing inventory needs verification", lane);
  // A departure date without a time denotes a calendar day. Comparing its
  // midnight instant against the current time would wrongly reject sailings
  // later today. Use UTC day comparison until a sailing timezone is supplied.
  const departureDay = typeof quote.departure_date === "string"
    && /^\\d{4}-\\d{2}-\\d{2}$/.test(quote.departure_date)
    && Number.isFinite(Date.parse(quote.departure_date))
    && new Date(quote.departure_date).toISOString().slice(0, 10) === quote.departure_date;
  const todayUTC = Number.isFinite(checkedAt) ? new Date(checkedAt).toISOString().slice(0, 10) : null;
  if (!departureDay || !promotion.departure_date
      || quote.departure_date < todayUTC
      || quote.departure_date !== promotion.departure_date
      || (quote.supplier && promotion.supplier && quote.supplier !== promotion.supplier))
    return hold("REJECT_VOYAGE", "Sailing departed or exact departure/supplier mismatch", lane);
  if (!quote.currency || !promotion.currency || quote.currency !== promotion.currency
      || !quote.occupancy_basis || quote.occupancy_basis !== promotion.occupancy_basis
      || !quote.category || !promotion.category || quote.category !== promotion.category
      || promotion.taxes_fees_known !== true)
    return hold("HOLD_COMPARABILITY", "Fare basis, taxes, currency, or category not comparable", lane);
  if (client.consent !== "opt_in" || client.cooldown_active === true)
    return hold("NO_OUTREACH", "Consent or contact cooldown prevents outreach", lane);
  // Passing eligibility means advisor review only, never sending permission.
  reasons.push("Identity, lifecycle, supplier, sailing and fare evidence passed");
  return { decision: "ADVISOR_REVIEW", lane, score: null, reasons, warnings,
    outreach_allowed: false, advisor_status: "needs_review" };
}
