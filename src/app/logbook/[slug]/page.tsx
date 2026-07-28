import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SectionHeading from "@/components/SectionHeading";
import TextLink from "@/components/TextLink";
import { getLogbookEntry, LOGBOOK_ENTRIES } from "@/lib/logbook";

import { LOGBOOK_BODIES } from "./bodies";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LOGBOOK_ENTRIES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getLogbookEntry(slug);
  if (!entry) return { title: "Not found" };
  return {
    title: entry.title,
    description: entry.dek,
    keywords: entry.keywords,
    alternates: { canonical: `/logbook/${slug}` },
  };
}

export default async function LogbookEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = getLogbookEntry(slug);
  const body = LOGBOOK_BODIES[slug];
  if (!entry || !body) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.dek,
    url: `https://www.bonvtravelcompany.com/logbook/${slug}`,
    datePublished: entry.datePublished,
    keywords: entry.keywords.join(", "),
    author: {
      "@type": "Person",
      name: "Jordan Yates",
      jobTitle: "Luxury Voyage Advisor",
    },
    publisher: {
      "@type": "TravelAgency",
      name: "BON V: A Travel Company",
      url: "https://www.bonvtravelcompany.com",
    },
  };

  return (
    <article className="px-6 py-14 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="mx-auto max-w-[42rem]">
        <TextLink href="/logbook" className="text-sm">
          &larr; The Logbook
        </TextLink>
        <SectionHeading
          kicker={`${entry.region} · ${entry.date} · ${entry.readingMinutes} min read`}
          title={entry.title}
          align="left"
          className="mt-8"
        />
        {body}
      </div>
    </article>
  );
}
