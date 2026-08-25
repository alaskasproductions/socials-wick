"use client";

import { useActionState } from "react";
import { saveSeoSettingsAction } from "@/lib/actions/settings";

export default function SeoSettingsForm({
  siteUrl,
  googleSiteVerification,
  googleAnalyticsId,
  businessName,
  businessAddress,
  businessCity,
  businessPostalCode,
  businessPhone,
}: {
  siteUrl: string;
  googleSiteVerification: string;
  googleAnalyticsId: string;
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessPostalCode: string;
  businessPhone: string;
}) {
  const [state, formAction, pending] = useActionState(saveSeoSettingsAction, undefined);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">
          {state.success}
        </p>
      )}

      <div>
        <label className="text-sm font-medium text-slate-200">Site URL</label>
        <input
          name="siteUrl"
          defaultValue={siteUrl}
          placeholder="https://socialswick.com"
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-xs text-slate-500">
          Your real production domain — used to build the sitemap, robots.txt, and canonical URLs.
        </p>
      </div>

      <div className="border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold text-slate-200">Google Search Console</h3>
        <div className="mt-2">
          <label className="text-sm font-medium text-slate-200">Verification Code</label>
          <input
            name="googleSiteVerification"
            defaultValue={googleSiteVerification}
            placeholder="e.g. abc123XYZ (the content= value only)"
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            In Search Console, choose the "HTML tag" verification method and paste just the{" "}
            <code className="font-mono text-slate-400">content</code> value here — we render the
            meta tag automatically.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold text-slate-200">Google Analytics</h3>
        <div className="mt-2">
          <label className="text-sm font-medium text-slate-200">Measurement ID</label>
          <input
            name="googleAnalyticsId"
            defaultValue={googleAnalyticsId}
            placeholder="G-XXXXXXXXXX"
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <h3 className="text-sm font-semibold text-slate-200">
          Business Info <span className="font-normal text-slate-500">(for local SEO in Cyprus)</span>
        </h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-200">Business Name</label>
            <input
              name="businessName"
              defaultValue={businessName}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-200">Phone</label>
            <input
              name="businessPhone"
              defaultValue={businessPhone}
              placeholder="+357 ..."
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-200">Street Address</label>
            <input
              name="businessAddress"
              defaultValue={businessAddress}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-200">City</label>
            <input
              name="businessCity"
              defaultValue={businessCity}
              placeholder="Nicosia"
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-200">Postal Code</label>
            <input
              name="businessPostalCode"
              defaultValue={businessPostalCode}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Country is fixed to Cyprus. This feeds the Organization structured data on every page —
          real details here strengthen local search relevance.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save SEO Settings"}
      </button>
    </form>
  );
}
