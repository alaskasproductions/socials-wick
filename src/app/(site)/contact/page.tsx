import Link from "next/link";
import { COMPANY } from "@/lib/company";
import { getTurnstileConfig } from "@/lib/turnstile";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact & Support — Socials Wick",
  description:
    "Get in touch with Socials Wick customer support. Email us, use the contact form, or chat with us — we reply within 24 hours.",
};

export default async function ContactPage() {
  const turnstile = await getTurnstileConfig();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Contact &amp; Support</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-400">
          Questions about an order, a payment or our services? Our support team is available 24/7
          and usually replies within a few hours.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <div className="glass rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Email support
            </h2>
            <a
              href={`mailto:${COMPANY.supportEmail}`}
              className="mt-2 block text-lg font-semibold text-brand hover:underline"
            >
              {COMPANY.supportEmail}
            </a>
            <p className="mt-1 text-sm text-slate-400">
              Available 24/7 · typical reply time under 24 hours
            </p>
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Live chat
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Use the chat bubble in the bottom-right corner of any page to talk to us in real time.
            </p>
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Order help
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Logged-in customers can track every order under{" "}
              <Link href="/dashboard/orders" className="text-brand hover:underline">
                Dashboard → Orders
              </Link>
              . Include your order ID in your message so we can look it up straight away.
            </p>
          </div>

          <div className="glass rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Company
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {COMPANY.legalName} (trading as {COMPANY.brand})
              <br />
              {COMPANY.address}
              <br />
              Registration no. {COMPANY.registrationNumber} · VAT {COMPANY.vatNumber}
            </p>
            <p className="mt-3 flex flex-wrap gap-3 text-xs">
              <Link href="/terms" className="text-brand hover:underline">
                Terms &amp; Conditions
              </Link>
              <Link href="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </Link>
              <Link href="/refund-policy" className="text-brand hover:underline">
                Refund Policy
              </Link>
            </p>
          </div>
        </div>

        <div className="glass rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">Send us a message</h2>
          <p className="mt-1 text-sm text-slate-400">We reply to every message by email.</p>
          <div className="mt-6">
            <ContactForm turnstileSiteKey={turnstile.enabled ? turnstile.siteKey : ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
