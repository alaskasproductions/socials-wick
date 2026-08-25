export const metadata = {
  title: "Privacy Policy — Socials Wick",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-3 text-sm text-slate-400">
        Last updated: 24 August 2026. This Policy explains how Socials Wick collects, uses, and
        protects your personal data in accordance with the EU General Data Protection Regulation
        (Regulation (EU) 2016/679, "GDPR") and applicable Cyprus data protection law, including
        the Processing of Personal Data (Protection of the Individual) Law and related national
        legislation.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">1. Data Controller</h2>
        <p className="mt-3 text-sm text-slate-300">
          The data controller responsible for your personal data is{" "}
          <strong>[Legal entity name], a company registered in the Republic of Cyprus under
          registration number [HE-XXXXXX]</strong>, with its registered office at{" "}
          <strong>[registered address], Cyprus</strong> ("Socials Wick", "we", "us"). For any
          privacy-related question or request, contact{" "}
          <a href="mailto:privacy@socialswick.com" className="text-brand hover:underline">
            privacy@socialswick.com
          </a>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">2. Data We Collect</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>
            <strong>Account data:</strong> name, email address, and password (stored as a salted
            hash, never in plain text).
          </li>
          <li>
            <strong>Order data:</strong> the Service ordered, the link/username targeted,
            quantity, price, and status of each Order you place.
          </li>
          <li>
            <strong>Payment data:</strong> transaction records and the payment method used. Full
            card numbers and sensitive payment credentials are handled directly by our payment
            processors and are never stored on our servers.
          </li>
          <li>
            <strong>Technical data:</strong> IP address, browser type, device information, and
            log data collected automatically when you use the Platform, for security and fraud
            prevention.
          </li>
          <li>
            <strong>Support communications:</strong> any information you provide when contacting
            support.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">3. Purposes & Legal Basis</h2>
        <p className="mt-3 text-sm text-slate-300">We process your personal data to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>
            Create and administer your account and deliver ordered Services{" "}
            <em>(performance of a contract, Art. 6(1)(b) GDPR)</em>;
          </li>
          <li>
            Process payments, prevent fraud, and comply with tax and accounting obligations{" "}
            <em>(legal obligation, Art. 6(1)(c) GDPR)</em>;
          </li>
          <li>
            Maintain the security of the Platform and investigate abuse or policy violations{" "}
            <em>(legitimate interest, Art. 6(1)(f) GDPR)</em>;
          </li>
          <li>
            Respond to support requests and communicate service-related notices{" "}
            <em>(performance of a contract / legitimate interest)</em>; and
          </li>
          <li>
            Send optional marketing communications, only where you have opted in{" "}
            <em>(consent, Art. 6(1)(a) GDPR)</em>, which you may withdraw at any time.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">4. Sharing Your Data</h2>
        <p className="mt-3 text-sm text-slate-300">
          We share personal data only where necessary, with: payment processors, to complete your
          transactions; our fulfillment provider(s), including MoreThanPanel, to the extent needed
          to deliver an ordered Service (typically limited to the target link/username and
          quantity, not your account or payment details); hosting and infrastructure providers who
          process data on our behalf under a data processing agreement; and public authorities,
          where legally required. We do not sell your personal data.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">5. International Transfers</h2>
        <p className="mt-3 text-sm text-slate-300">
          Where a service provider we use is located outside the European Economic Area, we rely
          on an adequacy decision or appropriate safeguards, such as the European Commission's
          Standard Contractual Clauses, to ensure your data remains protected to EU standards.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">6. Data Retention</h2>
        <p className="mt-3 text-sm text-slate-300">
          We retain account and order data for as long as your account is active, and for a
          reasonable period afterwards to comply with tax, accounting, and consumer-protection
          obligations under Cyprus and EU law (generally up to seven years for financial records).
          You may request earlier deletion as described in Section 7, subject to those legal
          retention requirements.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">7. Your Rights</h2>
        <p className="mt-3 text-sm text-slate-300">
          Under the GDPR, you have the right to: access the personal data we hold about you;
          request correction of inaccurate data; request erasure ("right to be forgotten"), where
          applicable; restrict or object to certain processing; request a portable copy of your
          data; and withdraw consent at any time where processing is based on consent. To exercise
          any of these rights, email{" "}
          <a href="mailto:privacy@socialswick.com" className="text-brand hover:underline">
            privacy@socialswick.com
          </a>
          . If you believe we have not handled your data properly, you also have the right to
          lodge a complaint with the Cyprus Commissioner for Personal Data Protection
          (<a
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

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">8. Cookies</h2>
        <p className="mt-3 text-sm text-slate-300">
          We use strictly necessary cookies to keep you signed in and secure your session, and
          limited analytics cookies to understand how the Platform is used. You can manage cookies
          through your browser settings at any time. See Section 11 of our{" "}
          <a href="/terms#tm-cookies" className="text-brand hover:underline">
            Terms & Conditions
          </a>{" "}
          for more detail.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">9. Security</h2>
        <p className="mt-3 text-sm text-slate-300">
          We apply appropriate technical and organizational measures to protect your data,
          including password hashing, encrypted connections (HTTPS), and access controls limiting
          who within our organization can view your data. No method of transmission or storage is
          completely secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">10. Changes to This Policy</h2>
        <p className="mt-3 text-sm text-slate-300">
          We may update this Privacy Policy from time to time. Material changes will be
          highlighted on the Platform, and the "Last updated" date above will reflect the most
          recent revision.
        </p>
      </section>
    </div>
  );
}
