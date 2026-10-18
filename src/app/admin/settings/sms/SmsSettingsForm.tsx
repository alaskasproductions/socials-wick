"use client";

import { useActionState } from "react";
import { checkSmsBalanceAction, saveSmsSettingsAction, sendTestSmsAction } from "@/lib/actions/sms";
import type { SmsEvent } from "@/lib/sms";

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none";
const labelClass = "text-sm font-medium text-slate-200";

function Message({ state }: { state: { error?: string; success?: string } | undefined }) {
  if (state?.error) return <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>;
  if (state?.success) return <p className="rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">{state.success}</p>;
  return null;
}

export default function SmsSettingsForm({
  enabled,
  apiUrl,
  senderId,
  phones,
  selectedEvents,
  hasToken,
  events,
}: {
  enabled: boolean;
  apiUrl: string;
  senderId: string;
  phones: string;
  selectedEvents: SmsEvent[];
  hasToken: boolean;
  events: { key: SmsEvent; label: string; hint: string }[];
}) {
  const [state, formAction, pending] = useActionState(saveSmsSettingsAction, undefined);
  const [testState, testAction, testing] = useActionState(sendTestSmsAction, undefined);
  const [balanceState, balanceAction, checking] = useActionState(checkSmsBalanceAction, undefined);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4" autoComplete="off">
        <Message state={state} />

        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <input type="checkbox" name="enabled" defaultChecked={enabled} className="h-4 w-4" />
          Send me an SMS when something happens
        </label>

        <div>
          <label className={labelClass} htmlFor="phones">
            Phone numbers
          </label>
          <input
            id="phones"
            name="phones"
            defaultValue={phones}
            autoComplete="off"
            placeholder="+357 99 123456, +357 96 654321"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            Separate several numbers with a comma. Cyprus numbers can be written without the country code.
          </p>
        </div>

        <fieldset>
          <legend className={labelClass}>Send an SMS for</legend>
          <div className="mt-2 space-y-2">
            {events.map((event) => (
              <label key={event.key} className="flex items-start gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  name={`event.${event.key}`}
                  defaultChecked={selectedEvents.includes(event.key)}
                  className="mt-0.5 h-4 w-4"
                />
                <span>
                  {event.label}
                  <span className="block text-xs text-slate-500">{event.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className={labelClass} htmlFor="token">
            SMSCY API token {hasToken && <span className="text-xs text-green-400">(saved)</span>}
          </label>
          <input
            id="token"
            name="token"
            type="password"
            autoComplete="new-password"
            placeholder={hasToken ? "•••••••••••••••• — leave blank to keep" : "Paste your API token"}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            Used server-side only, never sent to the browser. Type <code className="text-slate-400">clear</code> to
            remove it.
          </p>
        </div>

        <details>
          <summary className="cursor-pointer text-xs font-semibold text-slate-400">Advanced</summary>
          <div className="mt-3 space-y-3">
            <div>
              <label className={labelClass} htmlFor="senderId">
                Sender name
              </label>
              <input
                id="senderId"
                name="senderId"
                defaultValue={senderId}
                maxLength={11}
                autoComplete="off"
                placeholder="SocialsWick"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500">
                Up to 11 characters, and it must be approved in your SMSCY account.
              </p>
            </div>
            <div>
              <label className={labelClass} htmlFor="apiUrl">
                API address
              </label>
              <input
                id="apiUrl"
                name="apiUrl"
                defaultValue={apiUrl}
                autoComplete="off"
                placeholder="https://dash.smscy.com"
                className={inputClass}
              />
            </div>
          </div>
        </details>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save SMS Settings"}
        </button>
      </form>

      <div className="space-y-3 border-t border-white/10 pt-4">
        <Message state={testState} />
        <Message state={balanceState} />
        <div className="flex flex-wrap gap-3">
          <form action={testAction}>
            <button
              type="submit"
              disabled={testing}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60"
            >
              {testing ? "Sending…" : "Send a test SMS"}
            </button>
          </form>
          <form action={balanceAction}>
            <button
              type="submit"
              disabled={checking}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60"
            >
              {checking ? "Checking…" : "Check SMS balance"}
            </button>
          </form>
        </div>
        <p className="text-xs text-slate-500">
          A test message uses one SMS credit per number. Save your settings before testing.
        </p>
      </div>
    </div>
  );
}
