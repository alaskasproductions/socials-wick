import Link from "next/link";

const TOC = [
  ["tm-quick", "Quick Order Rules"],
  ["tm-overview", "Overview & Acceptance"],
  ["tm-nature", "Nature of Services"],
  ["tm-orders", "Orders & Service Delivery"],
  ["tm-refunds", "Refunds & Cancellations"],
  ["tm-payments", "Payments & Account Balance"],
  ["tm-api", "API & Reseller Use"],
  ["tm-prohibited", "Prohibited Uses"],
  ["tm-account", "Account, Security & Suspension"],
  ["tm-privacy", "Privacy & Personal Data"],
  ["tm-cookies", "Cookies & Analytics"],
  ["tm-legal", "Legal Terms & Governing Law"],
] as const;

export const metadata = {
  title: "Terms & Conditions — Socials Wick",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground">Terms & Conditions</h1>
      <p className="mt-3 text-sm text-slate-400">
        Last updated: 24 August 2026. Governed by the laws of the Republic of Cyprus.
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

      <section id="tm-quick" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">1. Quick Order Rules</h2>
        <p className="mt-3 text-sm text-slate-300">
          Before placing an order, please read the following. These rules apply to every order
          placed on Socials Wick and exist to protect both you and your account:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>Double-check the service description, quantity, and price before ordering.</li>
          <li>Enter the correct link, username, or identifier for the target account or post.</li>
          <li>
            Keep the target account or content public and accessible until the order is marked
            Completed.
          </li>
          <li>Do not change your username, handle, or privacy settings while an order is running.</li>
          <li>Do not place overlapping orders for the same link and service at the same time.</li>
          <li>
            Do not run the same target through another SMM panel or provider simultaneously — this
            frequently causes drops and is not covered by our refill policy.
          </li>
          <li>
            Funds added to your balance are, as a general rule, non-refundable once used to place
            an order — see Section 5 for the specific cases where a refund does apply.
          </li>
        </ul>
      </section>

      <section id="tm-overview" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">2. Overview & Acceptance</h2>
        <p className="mt-3 text-sm text-slate-300">
          These Terms & Conditions ("Terms") form a binding agreement between you ("Customer",
          "you") and Socials Wick ("Socials Wick", "we", "us", "our"), a service operated in
          accordance with the laws of the Republic of Cyprus. By creating an account, adding
          funds, or placing an order on socialswick.com (the "Platform"), you accept these Terms
          in full.
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Defined terms used throughout: <strong>Order</strong> means a request to deliver a
          specific quantity of a Service to a specified link. <strong>Service</strong> means any
          social-media-related product listed in our catalog. <strong>Balance</strong> means the
          prepaid credit held on your account. <strong>Completed</strong> means the ordered
          quantity was delivered in full. <strong>Partial</strong> means only part of the ordered
          quantity was delivered before the source became unavailable. <strong>Refill</strong>{" "}
          means the free replacement of quantity that dropped after delivery, where the Service
          description states a refill guarantee applies.
        </p>
        <p className="mt-3 text-sm text-slate-300">
          You must be at least 18 years old, or the age of legal majority in your jurisdiction if
          higher, to use the Platform. By registering, you confirm that the information you
          provide is accurate and that you have the legal capacity to enter into this agreement.
        </p>
      </section>

      <section id="tm-nature" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">3. Nature of Services</h2>
        <p className="mt-3 text-sm text-slate-300">
          Socials Wick provides digital promotional, advertising, traffic, and audience-building
          services for social media platforms (including Instagram, YouTube, TikTok, and
          Telegram). Services increase visible metrics such as followers, views, likes, or
          members. We do not guarantee sales, revenue, monetization eligibility, algorithmic
          reach, or any other business outcome unless expressly stated in the individual Service
          description.
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Services are provided independently of, and are not endorsed by, the social media
          platforms they target. Each platform's own terms of service govern what activity is
          permitted on that platform, and compliance with those third-party terms is your
          responsibility.
        </p>
      </section>

      <section id="tm-orders" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">4. Orders & Service Delivery</h2>
        <p className="mt-3 text-sm text-slate-300">
          Prices, minimum/maximum quantities, and service availability may change at any time
          without prior notice; the price and specification in effect at the moment you place an
          Order is the one that applies to that Order. Delivery times shown on the Platform are
          estimates, not guarantees.
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Some Services fulfil orders through third-party providers. We track delivery using a
          start count and remaining-quantity figure. Where a Service cannot be delivered in full
          because the source of engagement becomes unavailable, exhausted, or restricted, the
          Order will be marked Partial and charged only for the quantity actually delivered,
          where technically possible. Drip-feed or scheduled delivery, where offered, delivers the
          ordered quantity gradually over the stated period rather than instantly.
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Refill guarantees, where offered, apply strictly within the time window and conditions
          stated on the Service. A refill request outside that window, or for a Service without a
          stated guarantee, may be declined at our discretion.
        </p>
      </section>

      <section id="tm-refunds" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">5. Refunds & Cancellations</h2>
        <p className="mt-3 text-sm text-slate-300">
          A refund to your account Balance, or in exceptional cases to your original payment
          method, may be issued where:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>The ordered Service was unavailable and could not be delivered at all;</li>
          <li>Part of the ordered quantity was never delivered, for the undelivered portion only;</li>
          <li>You were charged twice for the same Order due to a technical error; or</li>
          <li>A verified processing or platform fault prevented delivery entirely.</li>
        </ul>
        <p className="mt-3 text-sm text-slate-300">A refund will not be issued where:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>You supplied an incorrect link, username, or quantity;</li>
          <li>The target account, page, or post was private, deleted, or restricted after ordering;</li>
          <li>The Order already reached Completed status;</li>
          <li>
            Delivered quantity later dropped due to third-party platform moderation, algorithm
            changes, or account action outside our control, unless a refill guarantee applied and
            was validly claimed within its window; or
          </li>
          <li>You breached Section 8 (Prohibited Uses) in connection with the Order.</li>
        </ul>
        <p className="mt-3 text-sm text-slate-300">
          Refund and cancellation requests must be submitted through your account dashboard or our
          support channels, referencing the Order ID, before we can investigate.
        </p>
      </section>

      <section id="tm-payments" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">6. Payments & Account Balance</h2>
        <p className="mt-3 text-sm text-slate-300">
          Funds added to your account are held as a prepaid Balance and may only be used to order
          Services on the Platform; the Balance is not a deposit account, does not accrue
          interest, and is non-transferable to another user. Payments are processed by third-party
          payment providers, and their own terms and any applicable processing fees apply to your
          transaction independently of these Terms.
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Where required by applicable Cyprus or EU tax law, VAT or other indirect taxes may be
          added to your payment based on your billing location. If you believe a charge was made
          in error, contact support before initiating a chargeback with your bank or payment
          provider. An unauthorized or bad-faith chargeback made after a Service has been
          delivered, in whole or in part, may result in immediate suspension of your account and
          recovery of the disputed amount by any lawful means available to us.
        </p>
      </section>

      <section id="tm-api" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">7. API & Reseller Use</h2>
        <p className="mt-3 text-sm text-slate-300">
          If we issue you an API key, you are responsible for keeping it confidential and for all
          activity carried out with it. If you resell our Services to your own customers, you are
          responsible for your own customer relationships, support, refund handling, and
          compliance with applicable law in your market; Socials Wick has no direct relationship
          with your end customers. You may not make false or misleading claims about delivery
          speed, quality, or outcomes when marketing resold Services, and you may not use the API
          to overload, disrupt, or probe the Platform's infrastructure.
        </p>
      </section>

      <section id="tm-prohibited" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">8. Prohibited Uses</h2>
        <p className="mt-3 text-sm text-slate-300">You may not use the Platform to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>Commit fraud, or pay using stolen, unauthorized, or fraudulently obtained funds;</li>
          <li>Distribute malware, phishing links, or other harmful content through an Order;</li>
          <li>Harass, defame, or target an individual or group;</li>
          <li>
            Promote illegal content or activity under the laws of the Republic of Cyprus or the
            European Union;
          </li>
          <li>Generate fake reviews or deceptive endorsements; or</li>
          <li>
            Reverse-engineer, scrape, copy, or otherwise exploit the Platform's software, pricing
            data, or service catalog beyond normal use of your account or API key.
          </li>
        </ul>
      </section>

      <section id="tm-account" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">9. Account, Security & Suspension</h2>
        <p className="mt-3 text-sm text-slate-300">
          You are responsible for using a strong password and for safeguarding your login
          credentials and API key. Notify us immediately if you suspect unauthorized access to
          your account. We may suspend or terminate an account, with or without notice, where we
          reasonably believe it has been used in breach of these Terms, for fraud or abuse, to
          interfere with Platform operations, or in a manner that exposes Socials Wick or other
          users to harm or legal risk. Any remaining Balance on a terminated account may be
          forfeited where termination results from a breach of these Terms.
        </p>
      </section>

      <section id="tm-privacy" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">10. Privacy & Personal Data</h2>
        <p className="mt-3 text-sm text-slate-300">
          We process personal data in accordance with the EU General Data Protection Regulation
          (Regulation (EU) 2016/679) and applicable Cyprus data protection law. Full details of
          what we collect, why, how long we keep it, and your rights are set out in our{" "}
          <Link href="/privacy" className="text-brand hover:underline">
            Privacy Policy
          </Link>
          , which forms part of these Terms.
        </p>
      </section>

      <section id="tm-cookies" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">11. Cookies & Analytics</h2>
        <p className="mt-3 text-sm text-slate-300">
          We use cookies and similar technologies that are strictly necessary to keep you signed
          in and to secure your session, along with limited analytics cookies to understand
          Platform usage. You can control or disable non-essential cookies through your browser
          settings; disabling strictly necessary cookies may prevent parts of the Platform,
          including login, from working correctly.
        </p>
      </section>

      <section id="tm-legal" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">12. Legal Terms & Governing Law</h2>
        <p className="mt-3 text-sm text-slate-300">
          All software, branding, text, and design on the Platform are the property of Socials Wick
          or its licensors and may not be copied or reused without permission. The Platform is
          provided on an "as is" and "as available" basis, without warranties of any kind, express
          or implied, to the maximum extent permitted by law.
        </p>
        <p className="mt-3 text-sm text-slate-300">
          To the maximum extent permitted under the laws of the Republic of Cyprus, Socials Wick
          shall not be liable for any indirect, incidental, special, or consequential loss,
          including loss of profits, data, goodwill, or business opportunity, arising from your
          use of the Platform. Our total liability for any claim arising from these Terms is
          limited to the amount you paid to us in the three (3) months preceding the claim. You
          agree to indemnify Socials Wick against claims, losses, and expenses arising from your
          breach of these Terms or misuse of the Platform.
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Third-party platforms referenced on Socials Wick (Instagram, YouTube, TikTok, Telegram,
          and others) are independent of Socials Wick and control their own terms of service,
          which we do not influence and are not party to.
        </p>
        <p className="mt-3 text-sm text-slate-300">
          These Terms, and any dispute or claim arising out of or in connection with them or their
          subject matter, are governed by and construed in accordance with the laws of the
          Republic of Cyprus, without regard to conflict-of-law principles. The courts of the
          Republic of Cyprus shall have exclusive jurisdiction over any such dispute, save that
          consumers resident in the European Union may also be entitled to bring proceedings in
          the courts of their own country of residence under applicable EU consumer-protection
          law. If you are an EU consumer, you may also submit a complaint through the European
          Commission's Online Dispute Resolution platform at{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:underline"
          >
            ec.europa.eu/consumers/odr
          </a>
          .
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Company details: Socials Wick is operated by{" "}
          <strong>[Legal entity name], a company registered in the Republic of Cyprus under
          registration number [HE-XXXXXX]</strong>, with its registered office at{" "}
          <strong>[registered address], Cyprus</strong>. For questions about these Terms, contact{" "}
          <a href="mailto:legal@socialswick.com" className="text-brand hover:underline">
            legal@socialswick.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
