"use client";

import { useEffect } from "react";

/**
 * Fire-and-forget first-party view beacon. Renders nothing. On mount it POSTs
 * the entity type + slug to /api/track, which resolves and stores the
 * normalized interest signal server-side. Honours Do-Not-Track, sends no
 * personal data, and never blocks or errors the page.
 */
export default function TrackView({
  entityType,
  slug,
}: {
  entityType: "journey" | "destination" | "page";
  slug?: string;
}) {
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") {
      return;
    }
    const payload = JSON.stringify({
      entityType,
      slug,
      path: window.location.pathname,
    });
    // keepalive lets the request survive a fast navigation away.
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {
      // Analytics must never surface to the visitor.
    });
  }, [entityType, slug]);

  return null;
}
