import { getSettings } from "@/lib/settings";
import VivaSettingsForm from "./VivaSettingsForm";
import StripeSettingsForm from "./StripeSettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSettings([
    "viva.enabled",
    "viva.env",
    "viva.sourceCode",
    "viva.clientId",
    "viva.clientSecret",
    "viva.webhookVerificationKey",
    "stripe.enabled",
    "stripe.publishableKey",
    "stripe.secretKey",
    "stripe.webhookSecret",
  ]);

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-400">
        Configure the payment gateways customers can use to add funds. Credentials are stored in
        the database — fill them in whenever you're ready, and toggle a gateway on to make it
        available on the Add Funds page.
      </p>

      <section>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">Viva Wallet</h3>
          <a
            href="https://developer.viva.com/apis-for-payments/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-brand hover:underline"
          >
            API docs →
          </a>
        </div>
        <div className="mt-4 glass rounded-xl p-6">
          <VivaSettingsForm
            enabled={settings["viva.enabled"] === "true"}
            env={settings["viva.env"] === "production" ? "production" : "demo"}
            sourceCode={settings["viva.sourceCode"] ?? ""}
            hasClientId={Boolean(settings["viva.clientId"])}
            hasClientSecret={Boolean(settings["viva.clientSecret"])}
            hasWebhookKey={Boolean(settings["viva.webhookVerificationKey"])}
          />
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">Stripe</h3>
          <a
            href="https://docs.stripe.com/payments/checkout"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-brand hover:underline"
          >
            API docs →
          </a>
        </div>
        <div className="mt-4 glass rounded-xl p-6">
          <StripeSettingsForm
            enabled={settings["stripe.enabled"] === "true"}
            publishableKey={settings["stripe.publishableKey"] ?? ""}
            hasSecretKey={Boolean(settings["stripe.secretKey"])}
            hasWebhookSecret={Boolean(settings["stripe.webhookSecret"])}
          />
        </div>
      </section>
    </div>
  );
}
