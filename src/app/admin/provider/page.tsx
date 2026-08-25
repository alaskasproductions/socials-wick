import * as provider from "@/lib/providers/morethanpanel";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { syncOrderStatusesAction } from "@/lib/actions/provider";
import ImportServicesForm from "./ImportServicesForm";
import SyncButton from "./SyncButton";
import MtpSettingsForm from "./MtpSettingsForm";

export default async function AdminProviderPage() {
  const [linkedCount, settings] = await Promise.all([
    prisma.service.count({ where: { providerServiceId: { not: null } } }),
    getSettings(["mtp.apiUrl", "mtp.apiKey"]),
  ]);

  let balance: { balance: string; currency: string } | null = null;
  let services: provider.ProviderService[] = [];
  let error: string | null = null;

  try {
    [balance, services] = await Promise.all([provider.getBalance(), provider.getServices()]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to reach MoreThanPanel.";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">MoreThanPanel Provider</h2>
        <p className="mt-1 text-sm text-slate-400">
          Sourcing fulfillment from{" "}
          <a
            href="https://morethanpanel.com/api"
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:underline"
          >
            morethanpanel.com
          </a>
          . Orders for imported services are sent to them automatically.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <div>
        <h3 className="font-semibold text-foreground">API Settings</h3>
        <div className="mt-4 max-w-xl glass rounded-xl p-6">
          <MtpSettingsForm
            apiUrl={settings["mtp.apiUrl"] || "https://morethanpanel.com/api/v2"}
            hasApiKey={Boolean(settings["mtp.apiKey"])}
          />
        </div>
      </div>

      {!error && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl glass p-5">
            <div className="text-sm text-slate-400">Provider Balance</div>
            <div className="mt-1 text-2xl font-bold text-brand">
              {Number(balance?.balance ?? 0).toFixed(2)} {balance?.currency}
            </div>
          </div>
          <div className="rounded-xl glass p-5">
            <div className="text-sm text-slate-400">Available Services</div>
            <div className="mt-1 text-2xl font-bold text-foreground">{services.length}</div>
          </div>
          <div className="rounded-xl glass p-5">
            <div className="text-sm text-slate-400">Linked in Catalog</div>
            <div className="mt-1 text-2xl font-bold text-foreground">{linkedCount}</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Order Status Sync</h3>
        <SyncButton action={syncOrderStatusesAction} />
      </div>

      {!error && (
        <div>
          <h3 className="font-semibold text-foreground">Import Services</h3>
          <p className="mt-1 text-sm text-slate-400">
            Select services to add to your catalog. Your sell price is the provider's rate plus
            the markup percentage below.
          </p>
          <div className="mt-4">
            <ImportServicesForm services={services} />
          </div>
        </div>
      )}
    </div>
  );
}
