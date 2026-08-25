import { getSeoConfig } from "@/lib/seo-settings";

// Organization schema with a Cyprus address — the main structured-data
// lever for local SEO (helps Google associate the business with Cyprus for
// "SMM panel Cyprus" style queries), short of a full Google Business Profile
// which is set up outside this codebase.
export default async function StructuredData() {
  const config = await getSeoConfig();

  const hasAddress = Boolean(config.businessAddress || config.businessCity);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.businessName,
    url: config.siteUrl,
    logo: `${config.siteUrl}/favicon.ico`,
    description:
      "Socials Wick is an SMM panel offering Instagram, YouTube, TikTok and Telegram growth services with instant delivery.",
    areaServed: ["CY", "Worldwide"],
    ...(hasAddress && {
      address: {
        "@type": "PostalAddress",
        streetAddress: config.businessAddress || undefined,
        addressLocality: config.businessCity || undefined,
        postalCode: config.businessPostalCode || undefined,
        addressCountry: "CY",
      },
    }),
    ...(config.businessPhone && {
      contactPoint: {
        "@type": "ContactPoint",
        telephone: config.businessPhone,
        contactType: "customer service",
        areaServed: "CY",
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
