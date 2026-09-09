import Link from "next/link";
import { COMPANY } from "@/lib/company";

export const metadata = {
  title: "Privacy Policy — Socials Wick",
};

const TOC = [
  ["pp-controller", "Data Controller"],
  ["pp-data", "Data We Collect"],
  ["pp-purposes", "Purposes & Legal Basis"],
  ["pp-sharing", "Sharing Your Data"],
  ["pp-payments", "Payments"],
  ["pp-security", "Account Security & Two-Factor Authentication"],
  ["pp-email", "Emails We Send"],
  ["pp-cookies", "Cookies & Analytics"],
  ["pp-transfers", "International Transfers"],
  ["pp-retention", "Data Retention"],
  ["pp-rights", "Your Rights"],
  ["pp-changes", "Changes to This Policy"],
] as const;

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-3 text-sm text-slate-400">
        Last updated: {COMPANY.legalUpdated}. This Policy explains how Socials Wick collects, uses,
        and protects your personal data in accordance with the EU General Data Protection
        Regulation (Regulation (EU) 2016/679, &quot;GDPR&quot;) and applicable Cyprus data
        protection law, including the Processing of Personal Data (Protection of the Individual)
        Law and related national legislation.
      </p>

      <nav className="mt-8 glass rounded-xl p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Quick Links
        </h2>
        <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {TOC.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="text-brand hover:underline">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="pp-controller" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">1. Data Controller</h2>
        <p className="mt-3 text-sm text-slate-300">
          The data controller responsible for your personal data is{" "}
          <strong>{COMPANY.legalName}</strong>, a company registered in the Republic of Cyprus
          under registration number <strong>{COMPANY.registrationNumber}</strong> (VAT number{" "}
          {COMPANY.vatNumber}), with its registered office at{" "}
          <strong>{COMPANY.address}</strong>, trading as &quot;Socials Wick&quot; (&quot;we&quot;,
          &quot;us&quot;). For any privacy-related question or request, contact{" "}
          <a href={`mailto:${COMPANY.privacyEmail}`} className="text-brand hover:underline">
            {COMPANY.privacyEmail}
          </a>
          .
        </p>
      </section>

      <section id="pp-data" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">2. Data We Collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>
            <strong>Account data:</strong> name, email address, and password (stored only as a
            salted bcrypt hash, never in plain text), the date you registered, whether your email
            address has been verified, and your account status.
          </li>
          <li>
            <strong>Security data:</strong> if you enable two-factor authentication, the
            authenticator secret for your account (stored encrypted — see Section 6); the API key
            issued to your account; and short-lived tokens we generate to verify your email address
            or reset your password.
          </li>
          <li>
            <strong>Order data:</strong> the Service ordered, the link/username targeted, quantity,
            price, status, and the reference assigned by our fulfilment provider.
          </li>
          <li>
            <strong>Payment and balance data:</strong> your prepaid balance, each top-up request
            (amount, method, status), and the transaction references returned by our payment
            providers (for card payments, the Viva Wallet order code and transaction ID). Full card
            numbers, CVV codes and other sensitive payment credentials are entered on the payment
            provider&apos;s own secure page and are never received or stored by us.
          </li>
          <li>
            <strong>Technical data:</strong> IP address, browser type, device information, and
            server log data collected automatically when you use the Platform, for security and
            fraud prevention.
          </li>
          <li>
            <strong>Usage data:</strong> pages viewed and interactions on the public Platform,
            collected through Google Analytics as described in Section 8.
          </li>
          <li>
            <strong>Support communications:</strong> any information you provide when contacting
            support by email or live chat.
          </li>
        </ul>
      </section>

      <section id="pp-purposes" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">3. Purposes &amp; Legal Basis</h2>
        <p className="mt-3 text-sm text-slate-300">We process your personal data to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>
            Create and administer your account, verify your email address, and deliver ordered
            Services <em>(performance of a contract, Art. 6(1)(b) GDPR)</em>;
          </li>
          <li>
            Process top-ups and payments, prevent fraud, and comply with tax and accounting
            obligations <em>(performance of a contract; legal obligation, Art. 6(1)(c) GDPR)</em>;
          </li>
          <li>
            Secure your account, including operating two-factor authentication and password
            resets, and investigate abuse or policy violations{" "}
            <em>(performance of a contract; legitimate interest, Art. 6(1)(f) GDPR)</em>;
          </li>
          <li>
            Understand how the public Platform is used and improve it, through aggregated analytics{" "}
            <em>(legitimate interest, Art. 6(1)(f) GDPR; consent where required for cookies)</em>;
          </li>
          <li>
            Respond to support requests and send service-related notices{" "}
            <em>(performance of a contract / legitimate interest)</em>; and
          </li>
          <li>
            Send optional marketing communications, only where you have opted in{" "}
            <em>(consent, Art. 6(1)(a) GDPR)</em>, which you may withdraw at any time.
          </li>
        </ul>
      </section>

      <section id="pp-sharing" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">4. Sharing Your Data</h2>
        <p className="mt-3 text-sm text-slate-300">
          We share personal data only where necessary, with the following categories of recipients.
          We do not sell your personal data.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>
            <strong>Payment providers</strong> — Viva Wallet (Viva Payment Services S.A. / Vivabank
            S.A., Greece, EU) for card payments, and Stripe (Stripe Payments Europe Ltd., Ireland)
            where offered. They receive the amount, a payment description, and where required your
            email address, and act as independent controllers for the payment itself under their
            own privacy policies.
          </li>
          <li>
            <strong>Fulfilment provider(s)</strong>, including MoreThanPanel, to the extent needed
            to deliver an ordered Service — typically limited to the target link/username and
            quantity, never your account or payment details.
          </li>
          <li>
            <strong>Hosting and infrastructure</strong> — our web and email servers are hosted in
            the EU (Contabo GmbH, Germany), and the Platform is delivered through Cloudflare, Inc.
            as a reverse proxy and DDoS-protection layer, which processes your IP address and
            request metadata on our behalf under a data processing agreement.
          </li>
          <li>
            <strong>Analytics</strong> — Google Ireland Ltd. (Google Analytics 4 and Google Search
            Console), as described in Section 8.
          </li>
          <li>
            <strong>Live chat</strong> — if a chat widget is enabled on the Platform, messages you
            send through it are processed by the chat provider (tawk.to) on our behalf.
          </li>
          <li>
            <strong>Public authorities</strong>, where we are legally required to do so.
          </li>
        </ul>
      </section>

      <section id="pp-payments" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">5. Payments</h2>
        <p className="mt-3 text-sm text-slate-300">
          Card payments are completed on Viva Wallet&apos;s secure hosted checkout page (Smart
          Checkout). Your card details are entered directly with Viva, which is a PCI DSS certified
          payment institution, and are never transmitted to or stored on our servers. After a
          successful payment Viva notifies us of the outcome together with a transaction reference,
          which we keep with your top-up record so that we can credit your balance, handle refunds
          and meet our accounting obligations. The card statement descriptor for payments may show
          our legal entity name, {COMPANY.legalName}. Top-ups requested by bank transfer or other
          manual methods are reviewed by our staff before your balance is credited.
        </p>
      </section>

      <section id="pp-security" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">
          6. Account Security &amp; Two-Factor Authentication
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          You can optionally protect your account with two-factor authentication using an
          authenticator app (time-based one-time passwords). When you enable it we generate a secret
          key, show it to you once as a QR code, and store it on our servers in encrypted form
          only; it is used solely to check the 6-digit codes you enter at login. Codes themselves are
          never stored. You can turn two-factor authentication off at any time from your account
          page with your password, and our support team can remove it from your account if you lose
          access to your device after confirming your identity. Passwords are stored as salted
          bcrypt hashes, all traffic is encrypted with HTTPS, and email-verification and
          password-reset links expire automatically after a short period.
        </p>
      </section>

      <section id="pp-email" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">7. Emails We Send</h2>
        <p className="mt-3 text-sm text-slate-300">
          We send transactional emails from our own mail server (addresses ending in
          @socialswick.com) to verify your email address, reset your password, and notify you about
          the status of your orders and top-ups. These messages are part of operating your account
          and cannot be opted out of while your account is active. Marketing emails, if any, are
          sent only with your consent and always contain an unsubscribe link.
        </p>
      </section>

      <section id="pp-cookies" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">8. Cookies &amp; Analytics</h2>
        <p className="mt-3 text-sm text-slate-300">The Platform uses the following cookies:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>
            <strong>Strictly necessary:</strong> the session cookie that keeps you signed in, a
            CSRF-protection cookie, and a short-lived cookie used during the two-factor
            authentication step of login. These cannot be disabled without breaking login.
          </li>
          <li>
            <strong>Cloudflare:</strong> cookies set by Cloudflare (such as <code>__cf_bm</code>)
            to distinguish humans from bots and protect the Platform from abuse.
          </li>
          <li>
            <strong>Analytics:</strong> Google Analytics 4 cookies (<code>_ga</code>,{" "}
            <code>_ga_*</code>) that assign your browser an anonymous identifier so we can measure
            visits, pages viewed, and traffic sources. Google Analytics 4 does not log or store IP
            addresses, and we do not link analytics data to your account. You can opt out with the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline"
            >
              Google Analytics opt-out browser add-on
            </a>{" "}
            or by blocking cookies in your browser.
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-300">
          We also use Google Search Console to monitor how our public pages appear in Google
          Search. It provides us aggregated search statistics only and sets no cookies on your
          device.
        </p>
      </section>

      <section id="pp-transfers" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">9. International Transfers</h2>
        <p className="mt-3 text-sm text-slate-300">
          Our servers and payment providers are located in the European Union. Where a service
          provider we use (for example Cloudflare or Google) may process data outside the European
          Economic Area, we rely on an adequacy decision (including the EU–US Data Privacy
          Framework where the provider is certified) or appropriate safeguards such as the European
          Commission&apos;s Standard Contractual Clauses, to ensure your data remains protected to EU
          standards.
        </p>
      </section>

      <section id="pp-retention" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">10. Data Retention</h2>
        <p className="mt-3 text-sm text-slate-300">
          We retain account and order data for as long as your account is active, and for a
          reasonable period afterwards to comply with tax, accounting, and consumer-protection
          obligations under Cyprus and EU law (generally up to seven years for payment and invoice
          records). Email-verification and password-reset tokens are deleted once used or expired,
          and two-factor secrets are deleted as soon as you disable the feature. Analytics data is
          retained by Google Analytics for 14 months. You may request earlier deletion as described
          in Section 11, subject to those legal retention requirements.
        </p>
      </section>

      <section id="pp-rights" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">11. Your Rights</h2>
        <p className="mt-3 text-sm text-slate-300">
          Under the GDPR, you have the right to: access the personal data we hold about you; request
          correction of inaccurate data; request erasure (&quot;right to be forgotten&quot;), where
          applicable; restrict or object to certain processing; request a portable copy of your
          data; and withdraw consent at any time where processing is based on consent. To exercise
          any of these rights, email{" "}
          <a href={`mailto:${COMPANY.privacyEmail}`} className="text-brand hover:underline">
            {COMPANY.privacyEmail}
          </a>
          . If you believe we have not handled your data properly, you also have the right to lodge
          a complaint with the Cyprus Commissioner for Personal Data Protection (
          <a
            href="https://www.dataprotection.gov.cy"
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:underline"
          >
            dataprotection.gov.cy
          </a>
          ) or your local EU supervisory authority.
        </p>
      </section>

      <section id="pp-changes" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">12. Changes to This Policy</h2>
        <p className="mt-3 text-sm text-slate-300">
          We may update this Privacy Policy from time to time. Material changes will be highlighted
          on the Platform, and the &quot;Last updated&quot; date above will reflect the most recent
          revision. This Policy should be read together with our{" "}
          <Link href="/terms" className="text-brand hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/refund-policy" className="text-brand hover:underline">
            Refund Policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
