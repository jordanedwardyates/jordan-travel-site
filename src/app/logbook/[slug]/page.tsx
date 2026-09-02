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
  const canonical = `/logbook/${slug}`;
  return {
    title: entry.title,
    description: entry.dek,
    keywords: entry.keywords,
    alternates: { canonical },
    // Route-level opengraph-image.tsx supplies the share art automatically.
    openGraph: {
      type: "article",
      siteName: "BON V: A Travel Company",
      locale: "en_US",
      title: entry.title,
      description: entry.dek,
      url: canonical,
      publishedTime: entry.datePublished,
      section: entry.region,
      tags: entry.keywords,
      authors: ["Jordan Yates"],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.dek,
    },
  };
}

export default async function LogbookEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = getLogbookEntry(slug);
  const body = LOGBOOK_BODIES[slug];
  if (!entry || !body) notFound();

  const BASE_URL = "https://www.bonvtravelcompany.com";
  const url = `${BASE_URL}/logbook/${slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: entry.title,
        description: entry.dek,
        url,
        mainEntityOfPage: url,
        image: `${url}/opengraph-image`,
        datePublished: entry.datePublished,
        dateModified: entry.datePublished,
        articleSection: entry.region,
        inLanguage: "en-US",
        keywords: entry.keywords.join(", "),
        author: {
          "@type": "Person",
          name: "Jordan Yates",
          jobTitle: "Luxury Voyage Advisor",
        },
        publisher: {
          "@type": "TravelAgency",
          "@id": `${BASE_URL}/#organization`,
          name: "BON V: A Travel Company",
          url: BASE_URL,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "The Logbook",
            item: `${BASE_URL}/logbook`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: entry.title,
            item: url,
          },
        ],
      },
    ],
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
