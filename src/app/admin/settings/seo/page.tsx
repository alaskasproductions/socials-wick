import { getSeoConfig } from "@/lib/seo-settings";
import SeoSettingsForm from "./SeoSettingsForm";

export default async function AdminSeoSettingsPage() {
  const seo = await getSeoConfig();

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Site URL, Google Search Console/Analytics, and business details used for local SEO
        (Organization structured data targeting Cyprus). The sitemap is auto-generated at{" "}
        <code className="font-mono text-slate-300">/sitemap.xml</code> and{" "}
        <code className="font-mono text-slate-300">/robots.txt</code> from the Site URL below.
      </p>

      <div className="glass max-w-2xl rounded-xl p-6">
        <SeoSettingsForm
          siteUrl={seo.siteUrl}
          googleSiteVerification={seo.googleSiteVerification}
          googleAnalyticsId={seo.googleAnalyticsId}
          businessName={seo.businessName}
          businessAddress={seo.businessAddress}
          businessCity={seo.businessCity}
          businessPostalCode={seo.businessPostalCode}
          businessPhone={seo.businessPhone}
        />
      </div>
    </div>
  );
}
