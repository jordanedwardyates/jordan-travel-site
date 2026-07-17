import type { Metadata, Viewport } from "next";
import { EB_Garamond, Geist, Mrs_Saint_Delafield } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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

const SITE_NAME = "BON V: A Travel Company";
const SITE_TITLE = "BON V: A Travel Company — A more thoughtful way to travel";
const SITE_DESCRIPTION =
  "Exceptional voyages on the world's finest cruise lines — expertly chosen, personally negotiated by Jordan Yates. Never pay retail.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bonvtravelcompany.com"),
  title: {
    default: SITE_TITLE,
    // Subpages set their own title; this frames it as the publication.
    template: "%s — BON V: A Travel Company",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Jordan Yates" }],
  creator: "Jordan Yates",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f1e8",
  colorScheme: "light",
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
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-vintage-passport focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
