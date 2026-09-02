import type { Metadata } from "next";
import { EB_Garamond, Geist, Mrs_Saint_Delafield } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DispatchPopup from "@/components/DispatchPopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
});

// Signature script — used only for Jordan's hand: the letter sign-off
// and "by Jordan" on the weekly-letter card.
const mrsSaintDelafield = Mrs_Saint_Delafield({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
});

const SITE_URL = "https://www.bonvtravelcompany.com";
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const DEFAULT_TITLE =
  "BON V: A Travel Company — A more thoughtful way to travel";
const DEFAULT_DESCRIPTION =
  "Exceptional voyages on the world's finest cruise lines — expertly chosen, personally negotiated by Jordan Yates. Never pay retail.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s — BON V: A Travel Company",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "BON V: A Travel Company",
  authors: [{ name: "Jordan Yates" }],
  creator: "Jordan Yates",
  publisher: "BON V: A Travel Company",
  category: "travel",
  alternates: { canonical: "/" },
  // The file-based opengraph-image.png (and route-level images) are attached
  // automatically by Next — we deliberately omit `images` here so those
  // conventions supply the share art rather than overriding them.
  openGraph: {
    type: "website",
    siteName: "BON V: A Travel Company",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description:
      "Exceptional voyages on the world's finest cruise lines — expertly chosen, personally negotiated. Never pay retail.",
  },
  // Let Google show full snippets and large image previews (editorial +
  // journey pages benefit most). Default crawl behaviour is otherwise index/follow.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "zoqB_9bIEmBqRtL6JRzXZ0VIW6DQr4p6QgJHakZDuUQ",
  },
};

// Organization + founder identity for rich results, plus a WebSite node so the
// two link into one entity graph (a @graph with stable @ids). Uses the public
// brand name only — the Brand Bible's internal working name must never appear
// here. Every value below is grounded in copy already published on the site.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TravelAgency",
      "@id": ORG_ID,
      name: "BON V: A Travel Company",
      alternateName: "BON V Travel Company",
      url: SITE_URL,
      description:
        "A boutique advisory for exceptional voyages on the world's finest cruise lines — expertly chosen and personally negotiated.",
      slogan: "A more thoughtful way to travel",
      image: `${SITE_URL}/opengraph-image.png`,
      logo: `${SITE_URL}/icon.svg`,
      telephone: "+1-904-614-1219",
      email: "jordan.yates@luxurycruiseconnections.com",
      priceRange: "$$$$",
      foundingDate: "2011",
      areaServed: "Worldwide",
      knowsAbout: [
        "Luxury cruises",
        "River cruises",
        "Ocean cruises",
        "Greek islands sailing",
        "Cruise line selection",
        "Negotiated cruise fares",
      ],
      memberOf: { "@type": "Organization", name: "Virtuoso" },
      // Connects this site to the brand's other profiles in Google's entity
      // graph. Handle taken from the Instagram content bank, where it is the
      // recorded `handle` field on the CTA slides ("@bonvtravel · link in bio").
      sameAs: ["https://www.instagram.com/bonvtravel/"],
      founder: {
        "@type": "Person",
        name: "Jordan Yates",
        jobTitle: "Luxury Voyage Advisor",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Service",
        telephone: "+1-904-614-1219",
        email: "jordan.yates@luxurycruiseconnections.com",
        areaServed: "Worldwide",
        availableLanguage: "English",
      },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE_URL,
      name: "BON V: A Travel Company",
      description: DEFAULT_DESCRIPTION,
      inLanguage: "en-US",
      publisher: { "@id": ORG_ID },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${ebGaramond.variable} ${mrsSaintDelafield.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-vintage-passport focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <DispatchPopup />
      </body>
    </html>
  );
}
