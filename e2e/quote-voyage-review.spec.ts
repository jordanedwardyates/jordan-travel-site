import { expect, test } from "@playwright/test";
import { assessQuoteVoyageReview } from "../src/lib/quote-voyage-review";

const voyage = (id: string, date: string | null) => ({ id, embarkation_date: date });

test("missing normalized quote items never imply a matching voyage", () => {
  const result = assessQuoteVoyageReview("2027-12-21", "Antarctica 2027", [], "2026-11-01");
  expect(result.linkedVoyageCount).toBe(0);
  expect(result.noStructuredVoyageData).toBe(true);
  expect(result.pipelineDateNotInQuote).toBe(false);
  expect(result.allLinkedDeparturesPast).toBe(false);
});

test("one matching sailing in a multi-option quote prevents date conflict", () => {
  const result = assessQuoteVoyageReview(
    "2027-02-14", "2027 ocean options",
    [voyage("a", "2026-10-31"), voyage("b", "2027-02-14")],
    "2026-11-01"
  );
  expect(result.linkedVoyageCount).toBe(2);
  expect(result.pipelineDateNotInQuote).toBe(false);
  expect(result.pipelineYearNotInQuote).toBe(false);
  expect(result.allLinkedDeparturesPast).toBe(false);
});

test("a fully departed quote is flagged as historical rather than a current offer", () => {
  const result = assessQuoteVoyageReview(
    null, "2027 options",
    [voyage("a", "2026-09-05"), voyage("b", "2026-10-31")],
    "2026-11-01"
  );
  expect(result.allLinkedDeparturesPast).toBe(true);
  expect(result.pipelineYearNotInQuote).toBe(true);
});

test("ambiguous reset from one year to another does not invent a year conflict", () => {
  const result = assessQuoteVoyageReview(
    null, "2026 itinerary reset for 2027",
    [voyage("a", "2026-10-15")],
    "2026-11-01"
  );
  expect(result.pipelineYearNotInQuote).toBe(false);
  expect(result.allLinkedDeparturesPast).toBe(true);
});

test("a known pipeline date conflicting with every linked sailing is flagged", () => {
  const result = assessQuoteVoyageReview(
    "2027-12-21", "2027 Antarctica",
    [voyage("a", "2027-12-20"), voyage("b", "2027-12-22")],
    "2026-11-01"
  );
  expect(result.pipelineDateNotInQuote).toBe(true);
  expect(result.pipelineYearNotInQuote).toBe(false);
});

test("duplicate quote items count the voyage once", () => {
  const result = assessQuoteVoyageReview(
    null, "2027 options",
    [voyage("same", "2027-02-14"), voyage("same", "2027-02-14")],
    "2026-11-01"
  );
  expect(result.linkedVoyageCount).toBe(1);
});

test("missing or invalid linked dates never create false conflict or departure claims", () => {
  const result = assessQuoteVoyageReview(
    "2027-02-14", "2027 options",
    [voyage("a", "2026-02-30"), voyage("b", "2026-09-05")],
    "2026-11-01"
  );
  expect(result.allLinkedDeparturesPast).toBe(false);
  expect(result.pipelineDateNotInQuote).toBe(false);
  expect(result.pipelineYearNotInQuote).toBe(false);
});

test("an invalid review date fails closed", () => {
  expect(() => assessQuoteVoyageReview(null, null, [], "2026-02-30")).toThrow();
});
