import { expect, test } from "@playwright/test";
import { assessQuoteReviewRisks } from "../src/lib/quote-review";

test("shared quote ID across two clients is flagged for manual review", () => {
  const flags = assessQuoteReviewRisks([
    { pipelineId: "p1", quotePackageId: "q1", matchMethod: "name_only", pipelineName: "Alex Client", quoteName: "Alex Client" },
    { pipelineId: "p2", quotePackageId: "q1", matchMethod: "name_only", pipelineName: "Alex Client", quoteName: "Alex Client" },
  ]);
  expect(flags.map((flag) => flag.quoteMatchesMultiplePipelineRecords)).toEqual([true, true]);
});

test("two matches for the same pipeline ID are not a cross-client collision", () => {
  const flags = assessQuoteReviewRisks([
    { pipelineId: "p1", quotePackageId: "q1", matchMethod: "name_only", pipelineName: "Alex Client", quoteName: "Alex Client" },
    { pipelineId: "p1", quotePackageId: "q1", matchMethod: "name_only", pipelineName: "Alex Client", quoteName: "Alex Client" },
  ]);
  expect(flags.every((flag) => !flag.quoteMatchesMultiplePipelineRecords)).toBe(true);
});

test("matching email with different recorded names is flagged, not auto-rejected", () => {
  const [flag] = assessQuoteReviewRisks([
    { pipelineId: "p1", quotePackageId: "q1", matchMethod: "exact_email", pipelineName: "Alex Client", quoteName: "Sam Client" },
  ]);
  expect(flag.differentRecordedNames).toBe(true);
});

test("normalized equivalent names do not create a warning", () => {
  const [flag] = assessQuoteReviewRisks([
    { pipelineId: "p1", quotePackageId: "q1", matchMethod: "exact_email", pipelineName: "  Alex   Client ", quoteName: "alex client" },
  ]);
  expect(flag.differentRecordedNames).toBe(false);
});

test("missing name evidence does not imply a mismatch", () => {
  const [flag] = assessQuoteReviewRisks([
    { pipelineId: "p1", quotePackageId: "q1", matchMethod: "exact_email", pipelineName: null, quoteName: "Alex Client" },
  ]);
  expect(flag.differentRecordedNames).toBe(false);
});
