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

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bonvtravelcompany.com"),
  title: {
    default: "BON V: A Travel Company — A more thoughtful way to travel",
    template: "%s — BON V: A Travel Company",
  },
  description:
    "Exceptional voyages on the world's finest cruise lines — expertly chosen, personally negotiated by Jordan Yates. Never pay retail.",
  alternates: { canonical: "/" },
  verification: {
    google: "zoqB_9bIEmBqRtL6JRzXZ0VIW6DQr4p6QgJHakZDuUQ",
  },
};

// Organization + founder identity for rich results. Uses the public brand
// name only — the Brand Bible's internal working name must never appear here.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "BON V: A Travel Company",
  url: "https://www.bonvtravelcompany.com",
  description:
    "A boutique advisory for exceptional voyages on the world's finest cruise lines — expertly chosen and personally negotiated.",
  telephone: "+1-904-614-1219",
  priceRange: "$$$$",
  founder: {
    "@type": "Person",
    name: "Jordan Yates",
    jobTitle: "Luxury Voyage Advisor",
  },
  areaServed: "Worldwide",
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
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
