"use client";

import { useVisitor } from "@/hooks/useVisitor";
import ChartedForYou from "@/components/ChartedForYou";

export default function VisitorTracker() {
  const visitorId = useVisitor();

  if (!visitorId) {
    return null;
  }

  return <ChartedForYou visitorId={visitorId} />;
}
