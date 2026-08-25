import { getSettings } from "@/lib/settings";
import EmailSettingsForm from "./EmailSettingsForm";

export default async function AdminEmailSettingsPage() {
  const settings = await getSettings([
    "smtp.host",
    "smtp.port",
    "smtp.secure",
    "smtp.username",
    "smtp.password",
    "smtp.fromName",
    "smtp.fromEmail",
    "smtp.adminEmail",
  ]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Configure the SMTP server used to send outgoing email — order and fund notifications to
        you as the admin, plus payment receipts and password resets to customers.
      </p>

      <div className="glass max-w-2xl rounded-xl p-6">
        <EmailSettingsForm
          host={settings["smtp.host"] ?? ""}
          port={settings["smtp.port"] ?? "587"}
          secure={settings["smtp.secure"] === "true"}
          username={settings["smtp.username"] ?? ""}
          fromName={settings["smtp.fromName"] ?? "Socials Wick"}
          fromEmail={settings["smtp.fromEmail"] ?? ""}
          adminEmail={settings["smtp.adminEmail"] ?? ""}
          hasPassword={Boolean(settings["smtp.password"])}
        />
      </div>
    </div>
  );
}
