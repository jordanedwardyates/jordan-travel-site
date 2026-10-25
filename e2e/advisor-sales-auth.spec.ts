import { expect, test } from "@playwright/test";

/**
 * Regression checks for the advisor-only Sales Desk.
 * These tests never need the real preview secret or client data.
 */
test("sales desk rejects anonymous requests and disables caching", async ({ request }) => {
  const response = await request.get("/internal/sales");
  expect([401, 404]).toContain(response.status());
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
});

test("sales desk rejects URL-token access", async ({ request }) => {
  const response = await request.get("/internal/sales?key=old-style-url-token");
  expect([401, 404]).toContain(response.status());
});

test("sales desk rejects invalid Basic credentials", async ({ request }) => {
  const invalidCredentials = Buffer.from("advisor:not-the-secret").toString("base64");
  const response = await request.get("/internal/sales", {
    headers: { Authorization: `Basic ${invalidCredentials}` },
  });
  expect([401, 404]).toContain(response.status());
});
