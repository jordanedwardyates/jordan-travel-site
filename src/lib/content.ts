/**
 * Shared editorial content model for hand-authored pages (Field Notes,
 * destination guides). These pieces are written by Jordan, not pulled from
 * the quote database — so they live in code, versioned with the site.
 */

export type Block =
  | { type: "para"; text: string }
  | { type: "subhead"; text: string }
  | { type: "pull"; text: string };
