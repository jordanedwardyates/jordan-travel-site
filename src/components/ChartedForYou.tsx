"use client";

import { useEffect, useState } from "react";
import type { Journey } from "@/components/JourneyCard";
import JourneyCard from "@/components/JourneyCard";
import SectionHeading from "@/components/SectionHeading";
import PassportStamp from "@/components/PassportStamp";
import { getVisitorRecommendations } from "@/app/visitor-actions";

type Props = {
  visitorId: string | null;
};

export default function ChartedForYou({ visitorId }: Props) {
  const [recommendations, setRecommendations] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visitorId) {
      setLoading(false);
      return;
    }

    getVisitorRecommendations(visitorId, 2).then((recs) => {
      setRecommendations(recs);
      setLoading(false);
    });
  }, [visitorId]);

  if (loading || !visitorId || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="weathered clip-section px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="relative">
          <PassportStamp
            text="· CHARTED FOR YOU · JORDAN YATES ·"
            className="stamp-settle absolute -top-6 right-0 hidden h-20 w-20 rotate-12 text-sun-faded opacity-20 lg:block"
          />
          <SectionHeading
            kicker="Based on Your Interests"
            title="Charted for you"
          />
        </div>
        <p className="mx-auto mt-6 max-w-[52ch] text-center font-serif text-lg leading-relaxed text-aegean-ink">
          Journeys tailored to the regions and voyages you&rsquo;ve been exploring.
        </p>

        <div className="mt-10 space-y-8">
          {recommendations.map((journey) => (
            <div key={journey.id} className="ink-rise">
              <JourneyCard journey={journey} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
