import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollProgress from "@/components/ScrollProgress";
import StructuredData from "@/components/StructuredData";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import TawkToWidget from "@/components/TawkToWidget";
import { getSeoConfig, getTawkToConfig } from "@/lib/seo-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_TITLE = "Socials Wick — Best SMM Panel for Instagram, YouTube & TikTok Growth";
const SITE_DESCRIPTION =
  "Socials Wick is a fast, affordable SMM panel for Instagram followers, YouTube subscribers, TikTok views, Telegram members and more. Instant delivery, secure payments, API access. Serving Cyprus and worldwide.";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoConfig();

  return {
    metadataBase: new URL(seo.siteUrl),
    title: {
      default: SITE_TITLE,
      template: "%s — Socials Wick",
    },
    description: SITE_DESCRIPTION,
    keywords: [
      "SMM panel",
      "SMM panel Cyprus",
      "Instagram followers",
      "YouTube subscribers",
      "TikTok views",
      "Telegram members",
      "social media marketing panel",
    ],
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: seo.siteUrl,
      siteName: "Socials Wick",
      images: ["/images/hero-bg.png"],
      locale: "en_CY",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: ["/images/hero-bg.png"],
    },
    ...(seo.googleSiteVerification && {
      verification: { google: seo.googleSiteVerification },
    }),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [seo, tawk] = await Promise.all([getSeoConfig(), getTawkToConfig()]);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="ambient-glow" />
        <ScrollProgress />
        {children}
        <StructuredData />
        {seo.googleAnalyticsId && <GoogleAnalytics measurementId={seo.googleAnalyticsId} />}
        {tawk.enabled && <TawkToWidget propertyId={tawk.propertyId} widgetId={tawk.widgetId} />}
      </body>
    </html>
  );
}
