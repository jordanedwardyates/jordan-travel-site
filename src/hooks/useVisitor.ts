"use client";

import { useEffect, useRef } from "react";
import {
  ensureVisitorProfile,
  logVisitorEvent,
} from "@/app/visitor-actions";

export function useVisitor() {
  const visitorIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Get or create visitor ID from cookie
    let visitorId = getCookie("visitor_id");
    if (!visitorId) {
      visitorId = generateUUID();
      setCookie("visitor_id", visitorId, 365 * 24 * 60 * 60); // 1 year
    }

    visitorIdRef.current = visitorId;

    // Ensure profile exists and log page view
    ensureVisitorProfile(visitorId).then(() => {
      logVisitorEvent(visitorId, "page_view", undefined, {
        pathname: window.location.pathname,
      });
    });

    // Track when user clicks on a journey link
    const trackJourneyClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest("[data-journey-id]");
      if (link) {
        const journeyId = link.getAttribute("data-journey-id");
        const region = link.getAttribute("data-region");
        if (journeyId && visitorId) {
          logVisitorEvent(visitorId, "journey_view", journeyId, {
            region,
          });
        }
      }
    };

    document.addEventListener("click", trackJourneyClick);
    return () => {
      document.removeEventListener("click", trackJourneyClick);
    };
  }, []);

  return visitorIdRef.current;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]+)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(
  name: string,
  value: string,
  maxAge: number
): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
