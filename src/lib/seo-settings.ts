import { getSetting, getSettings } from "@/lib/settings";

export async function getSiteUrl(): Promise<string> {
  const url = await getSetting("seo.siteUrl", "SITE_URL");
  return (url || "http://localhost:3000").replace(/\/$/, "");
}

export type SeoConfig = {
  siteUrl: string;
  googleSiteVerification: string;
  googleAnalyticsId: string;
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessPostalCode: string;
  businessPhone: string;
};

export async function getSeoConfig(): Promise<SeoConfig> {
  const [siteUrl, s] = await Promise.all([
    getSiteUrl(),
    getSettings([
      "seo.googleSiteVerification",
      "seo.googleAnalyticsId",
      "seo.businessName",
      "seo.businessAddress",
      "seo.businessCity",
      "seo.businessPostalCode",
      "seo.businessPhone",
    ]),
  ]);

  return {
    siteUrl,
    googleSiteVerification: s["seo.googleSiteVerification"] || process.env.GOOGLE_SITE_VERIFICATION || "",
    googleAnalyticsId: s["seo.googleAnalyticsId"] || process.env.GOOGLE_ANALYTICS_ID || "",
    businessName: s["seo.businessName"] || "Socials Wick",
    businessAddress: s["seo.businessAddress"] || "",
    businessCity: s["seo.businessCity"] || "Nicosia",
    businessPostalCode: s["seo.businessPostalCode"] || "",
    businessPhone: s["seo.businessPhone"] || "",
  };
}

export type TawkToConfig = {
  enabled: boolean;
  propertyId: string;
  widgetId: string;
};

export async function getTawkToConfig(): Promise<TawkToConfig> {
  const s = await getSettings(["tawkto.enabled", "tawkto.propertyId", "tawkto.widgetId"]);
  return {
    enabled: s["tawkto.enabled"] === "true",
    propertyId: s["tawkto.propertyId"] || process.env.TAWKTO_PROPERTY_ID || "",
    widgetId: s["tawkto.widgetId"] || process.env.TAWKTO_WIDGET_ID || "default",
  };
}
