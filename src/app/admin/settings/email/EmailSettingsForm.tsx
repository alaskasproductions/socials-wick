"use client";

import { useActionState } from "react";
import { saveEmailSettingsAction, sendTestEmailAction } from "@/lib/actions/settings";

export default function EmailSettingsForm({
  host,
  port,
  secure,
  username,
  fromName,
  fromEmail,
  adminEmail,
  hasPassword,
}: {
  host: string;
  port: string;
  secure: boolean;
  username: string;
  fromName: string;
  fromEmail: string;
  adminEmail: string;
  hasPassword: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveEmailSettingsAction, undefined);
  const [testState, testAction, testPending] = useActionState(sendTestEmailAction, undefined);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
        )}
        {state?.success && (
          <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">
            {state.success}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-200">SMTP Host</label>
            <input
              name="host"
              defaultValue={host}
              placeholder="smtp.example.com"
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-200">Port</label>
            <input
              name="port"
              defaultValue={port}
              placeholder="587"
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <input type="checkbox" name="secure" defaultChecked={secure} className="h-4 w-4" />
          Use SSL/TLS (typically on for port 465, off for 587/25 which use STARTTLS)
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-200">Username</label>
            <input
              name="username"
              defaultValue={username}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-200">
              Password {hasPassword && <span className="text-xs text-green-400">(saved)</span>}
            </label>
            <input
              name="password"
              type="password"
              placeholder={hasPassword ? "•••••••••••••••• — leave blank to keep" : "SMTP password"}
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-200">From Name</label>
            <input
              name="fromName"
              defaultValue={fromName}
              placeholder="Socials Wick"
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-200">From Email</label>
            <input
              name="fromEmail"
              type="email"
              defaultValue={fromEmail}
              placeholder="no-reply@socialswick.com"
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-200">Admin Notification Email</label>
          <input
            name="adminEmail"
            type="email"
            defaultValue={adminEmail}
            placeholder="admin@socialswick.com"
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            Where you'll receive new order and fund-request alerts. Defaults to the From Email if
            left blank.
          </p>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save Email Settings"}
        </button>
      </form>

      <div className="border-t border-white/10 pt-4">
        <form action={testAction} className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={testPending}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60"
          >
            {testPending ? "Sending…" : "Send Test Email"}
          </button>
          {testState?.success && <span className="text-sm text-green-400">{testState.success}</span>}
          {testState?.error && <span className="text-sm text-red-400">{testState.error}</span>}
        </form>
      </div>
    </div>
  );
}
