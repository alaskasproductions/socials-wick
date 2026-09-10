import { getSettings } from "@/lib/settings";
import SecuritySettingsForm from "./SecuritySettingsForm";

export default async function AdminSecuritySettingsPage() {
  const settings = await getSettings(["security.turnstileSiteKey", "security.turnstileSecretKey"]);
  const enabled = Boolean(settings["security.turnstileSiteKey"] && settings["security.turnstileSecretKey"]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Cloudflare Turnstile protects the login, registration and password-reset forms from bots
        without a CAPTCHA puzzle. Create a widget in Cloudflare → Turnstile for{" "}
        <code className="text-slate-300">socialswick.com</code> and paste its keys here. The check
        is active only while both keys are saved.
      </p>
      <p className="text-sm">
        Status:{" "}
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${enabled ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-300"}`}>
          {enabled ? "Turnstile active" : "Turnstile off — keys missing"}
        </span>
      </p>

      <div className="glass max-w-2xl rounded-xl p-6">
        <SecuritySettingsForm
          siteKey={settings["security.turnstileSiteKey"] ?? ""}
          hasSecretKey={Boolean(settings["security.turnstileSecretKey"])}
        />
      </div>
    </div>
  );
}
