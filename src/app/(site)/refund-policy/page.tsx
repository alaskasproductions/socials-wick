import Link from "next/link";
import { COMPANY } from "@/lib/company";

export const metadata = {
  title: "Refund Policy",
  alternates: { canonical: "/refund-policy" },
};

const TOC = [
  ["rp-summary", "Summary"],
  ["rp-topups", "Balance Top-Ups"],
  ["rp-orders", "Orders"],
  ["rp-withdrawal", "EU 14-Day Right of Withdrawal"],
  ["rp-how", "How to Request a Refund"],
  ["rp-method", "How Refunds Are Paid"],
  ["rp-chargebacks", "Chargebacks & Disputes"],
  ["rp-contact", "Contact"],
] as const;

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground">Refund Policy</h1>
      <p className="mt-3 text-sm text-slate-400">
        Last updated: {COMPANY.legalUpdated}. This Refund Policy forms part of our{" "}
        <Link href="/terms" className="text-brand hover:underline">
          Terms &amp; Conditions
        </Link>{" "}
        and applies to every payment made to {COMPANY.legalName} (trading as Socials Wick) on
        socialswick.com. If anything here conflicts with the Terms, this Policy prevails for
        refund matters.
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

      <section id="rp-summary" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">1. Summary</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>
            <strong>Unused balance</strong> can be refunded to your original payment method on
            request within 14 days of the top-up.
          </li>
          <li>
            <strong>Orders that were never delivered</strong> are refunded in full to your balance
            automatically or on request; <strong>partially delivered</strong> orders are refunded
            for the undelivered quantity.
          </li>
          <li>
            <strong>Completed orders</strong> are not refundable, because the service has been
            performed in full.
          </li>
          <li>
            Refunds to a card go back to the <strong>same card</strong> used to pay; we cannot pay
            refunds to a different card, account or person.
          </li>
        </ul>
      </section>

      <section id="rp-topups" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">2. Balance Top-Ups</h2>
        <p className="mt-3 text-sm text-slate-300">
          Funds you add to your account are held as a prepaid balance that can only be spent on
          Services on the Platform. If you change your mind, you may ask us to refund any balance
          that has <strong>not yet been spent</strong>, within 14 days of the payment. Balance that
          has been used to place orders is subject to Section 3 instead. Balance credited to you as
          a goodwill gesture, promotional credit, or as compensation for a failed order is not
          eligible for a cash refund.
        </p>
        <p className="mt-3 text-sm text-slate-300">
          Top-ups made by bank transfer or other manual methods are only refundable once the funds
          have actually arrived and been credited; we will return them to the same bank account they
          came from.
        </p>
      </section>

      <section id="rp-orders" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">3. Orders</h2>
        <p className="mt-3 text-sm text-slate-300">A refund to your balance will be issued where:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>the ordered Service was unavailable and could not be delivered at all;</li>
          <li>
            only part of the ordered quantity was delivered (Partial status) — for the undelivered
            portion only;
          </li>
          <li>you were charged twice for the same order because of a technical error; or</li>
          <li>a verified processing or platform fault on our side prevented delivery.</li>
        </ul>
        <p className="mt-3 text-sm text-slate-300">A refund will not be issued where:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>you supplied an incorrect link, username, or quantity;</li>
          <li>
            the target account, page, or post was private, deleted, or restricted after ordering;
          </li>
          <li>the order already reached Completed status;</li>
          <li>
            the delivered quantity later dropped because of the social platform&apos;s moderation
            or algorithm changes — where the Service carried a refill guarantee, claim the refill
            within its stated window instead;
          </li>
          <li>
            you ran the same target through another provider at the same time, changed the
            username or privacy settings during delivery, or otherwise breached the Terms.
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-300">
          Orders can be cancelled only while they are still Pending (not yet sent to fulfilment).
          Once an order is In Progress it can no longer be cancelled, but you remain protected by the
          Partial-delivery rule above.
        </p>
      </section>

      <section id="rp-withdrawal" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">4. EU 14-Day Right of Withdrawal</h2>
        <p className="mt-3 text-sm text-slate-300">
          If you are a consumer resident in the European Union or the European Economic Area, you
          have a statutory right to withdraw from a distance contract within <strong>14 days</strong>{" "}
          without giving any reason, under Directive 2011/83/EU on consumer rights as transposed in
          Cyprus by the Consumer Rights Law of 2013 (Law 133(I)/2013) and the equivalent law of your
          own country. This right applies in addition to, and is not limited by, the rest of this
          Policy.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>
            <strong>Balance top-ups:</strong> the withdrawal period runs for 14 days from the day of
            the payment. If you withdraw, we reimburse the balance that has not yet been spent on
            orders. Balance already used for orders is treated as a service you asked us to perform
            during the withdrawal period, and only the amount proportionate to what has been
            delivered is retained (Article 14(3) of the Directive).
          </li>
          <li>
            <strong>Orders:</strong> when you place an order you expressly request that we start
            performing the service immediately, within the withdrawal period, and you acknowledge
            that once the service has been <strong>fully performed</strong> (order status
            Completed) you lose the right of withdrawal (Article 16(a)). If you withdraw while an
            order is only partly performed, you pay only for the part delivered and the rest is
            refunded.
          </li>
          <li>
            <strong>How to withdraw:</strong> send us an unequivocal statement of your decision —
            an email to{" "}
            <a href={`mailto:${COMPANY.supportEmail}`} className="text-brand hover:underline">
              {COMPANY.supportEmail}
            </a>{" "}
            is enough. You may use the model form below but you do not have to. Sending the
            statement before the 14-day period ends is sufficient to meet the deadline.
          </li>
          <li>
            <strong>Reimbursement:</strong> we reimburse you without undue delay and in any event no
            later than <strong>14 days</strong> from the day we receive your withdrawal statement,
            using the same means of payment you used for the original transaction, without any
            fee.
          </li>
        </ul>
        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="font-semibold text-foreground">Model withdrawal form</p>
          <p className="mt-2">
            To: {COMPANY.legalName} (Socials Wick), {COMPANY.address},{" "}
            {COMPANY.supportEmail}
          </p>
          <p className="mt-2">
            I/We hereby give notice that I/we withdraw from my/our contract for the provision of the
            following service: [order ID or top-up date and amount]. Ordered on: [date]. Name of
            consumer: [name]. Address of consumer: [address]. Email used on the account: [email].
            Date: [date].
          </p>
        </div>
        <p className="mt-3 text-sm text-slate-300">
          Nothing in this Policy affects your statutory rights under EU or national consumer law,
          including your rights where a service is not provided with reasonable care and skill.
        </p>
      </section>

      <section id="rp-how" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">5. How to Request a Refund</h2>
        <p className="mt-3 text-sm text-slate-300">
          Email{" "}
          <a href={`mailto:${COMPANY.supportEmail}`} className="text-brand hover:underline">
            {COMPANY.supportEmail}
          </a>{" "}
          from the address registered on your account and include: the Order ID (for order
          refunds) or the top-up date, amount and payment method (for balance refunds), and a short
          description of the problem. We acknowledge requests within 2 business days and decide most
          cases within 5 business days. Investigations involving our fulfilment provider may take a
          little longer, but any refund due is always paid within the 14-day deadline in Section 4.
        </p>
      </section>

      <section id="rp-method" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">6. How Refunds Are Paid</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>
            <strong>Order refunds</strong> are credited to your account balance immediately, so you
            can reorder or request a payout under Section 2 if the balance is unused.
          </li>
          <li>
            <strong>Card payments (Viva Wallet, Stripe)</strong> are refunded to the original card
            through the same payment provider, no later than 14 days after we receive your request.
            Depending on your bank, the money then appears on your statement within 3–10 business
            days.
          </li>
          <li>
            <strong>Bank transfers</strong> are returned to the originating account, no later than
            14 days after we receive your request.
          </li>
          <li>
            We refund the full amount paid; we do not deduct our own fees. Currency conversion
            differences or fees charged by your bank or card issuer are outside our control.
          </li>
        </ul>
      </section>

      <section id="rp-chargebacks" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">7. Chargebacks &amp; Disputes</h2>
        <p className="mt-3 text-sm text-slate-300">
          Please contact us before disputing a charge with your bank — almost every issue can be
          resolved faster through this Policy. Opening a chargeback for a payment whose services
          have already been delivered, in whole or in part, is treated as a breach of the Terms: the
          account is suspended while the dispute is open, any remaining balance is frozen, and we
          will provide the payment provider with our delivery records.
        </p>
      </section>

      <section id="rp-contact" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground">8. Contact</h2>
        <p className="mt-3 text-sm text-slate-300">
          {COMPANY.legalName}, registration number {COMPANY.registrationNumber}, VAT{" "}
          {COMPANY.vatNumber}, {COMPANY.address}.{" "}
          <a href={`mailto:${COMPANY.supportEmail}`} className="text-brand hover:underline">
            {COMPANY.supportEmail}
          </a>
          . EU consumers may also use the European Commission&apos;s Online Dispute Resolution
          platform at{" "}
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
      </section>
    </div>
  );
}
