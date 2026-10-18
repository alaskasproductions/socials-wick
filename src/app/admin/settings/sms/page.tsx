import { getSettings } from "@/lib/settings";
import { getSmsConfig, SMS_EVENTS } from "@/lib/sms";
import SmsSettingsForm from "./SmsSettingsForm";

export default async function AdminSmsSettingsPage() {
  const [raw, config] = await Promise.all([
    getSettings(["sms.apiUrl", "sms.senderId", "sms.phones", "sms.events", "sms.token"]),
    getSmsConfig(),
  ]);

  const active = config.enabled && config.configured;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Get a text message the moment something happens on the panel, through{" "}
        <a href="https://dash.smscy.com" target="_blank" rel="noreferrer" className="text-brand hover:underline">
          SMSCY
        </a>
        . Create an API token in your SMSCY account under Developers → API tokens, paste it here, and add the
        numbers that should receive the alerts.
      </p>
      <p className="text-sm">
        Status:{" "}
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-300"}`}
        >
          {active
            ? `On — alerts go to ${config.phones.length} number${config.phones.length === 1 ? "" : "s"}`
            : config.enabled
              ? "Off — add a token and a phone number"
              : "Off"}
        </span>
      </p>

      <div className="glass max-w-2xl rounded-xl p-6">
        <SmsSettingsForm
          enabled={config.enabled}
          apiUrl={raw["sms.apiUrl"] ?? ""}
          senderId={raw["sms.senderId"] ?? ""}
          phones={raw["sms.phones"] ?? ""}
          selectedEvents={config.events}
          hasToken={Boolean(raw["sms.token"])}
          events={SMS_EVENTS}
        />
      </div>
    </div>
  );
}
