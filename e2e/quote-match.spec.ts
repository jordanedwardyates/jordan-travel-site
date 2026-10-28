import { expect, test } from "@playwright/test";
import { matchQuoteIdentity } from "../src/lib/quote-match";

/**
 * Synthetic data only. A match is a suggested review, never an approved link.
 */
test("exact email matches despite case and whitespace", () => {
  expect(matchQuoteIdentity(
    { client_name: "A. Client", client_email: " CLIENT@example.com " },
    { client_name: "A Client", client_email: "client@EXAMPLE.com" }
  )).toBe("exact_email");
});

test("conflicting populated emails veto identical names", () => {
  expect(matchQuoteIdentity(
    { client_name: "Alex Sample", client_email: "alex1@example.com" },
    { client_name: "Alex Sample", client_email: "alex2@example.com" }
  )).toBeNull();
});

test("full normalized name match is review-only when email is absent", () => {
  expect(matchQuoteIdentity(
    { client_name: "  Alex   Sample ", client_email: null },
    { client_name: "alex sample", client_email: "alex@example.com" }
  )).toBe("name_only");
});

test("similar but non-identical names do not match", () => {
  expect(matchQuoteIdentity(
    { client_name: "Alex Sample", client_email: null },
    { client_name: "Alexandra Sample", client_email: null }
  )).toBeNull();
});

test("missing identity never matches", () => {
  expect(matchQuoteIdentity(
    { client_name: null, client_email: null },
    { client_name: null, client_email: null }
  )).toBeNull();
});

test("same full name with both emails absent is only name-only", () => {
  expect(matchQuoteIdentity(
    { client_name: "Alex Sample", client_email: null },
    { client_name: "Alex Sample", client_email: null }
  )).toBe("name_only");
});
