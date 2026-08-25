import { getTawkToConfig } from "@/lib/seo-settings";
import TawkToSettingsForm from "./TawkToSettingsForm";

export default async function AdminLiveChatSettingsPage() {
  const tawk = await getTawkToConfig();

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Add a{" "}
        <a
          href="https://www.tawk.to/"
          target="_blank"
          rel="noreferrer"
          className="text-brand hover:underline"
        >
          Tawk.to
        </a>{" "}
        live chat widget to every page of the site. Find your Property ID and Widget ID under
        Tawk.to → Administration → Channels → Chat Widget.
      </p>

      <div className="glass max-w-xl rounded-xl p-6">
        <TawkToSettingsForm
          enabled={tawk.enabled}
          propertyId={tawk.propertyId}
          widgetId={tawk.widgetId}
        />
      </div>
    </div>
  );
}
