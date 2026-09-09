"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  cancelTotpSetupAction,
  confirmTotpAction,
  disableTotpAction,
  startTotpSetupAction,
  type TotpSetup,
} from "@/lib/actions/totp";

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none";
const primaryButton =
  "rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60";
const secondaryButton =
  "rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-60";

export default function TwoFactorSettings({
  enabled,
  enabledAt,
}: {
  enabled: boolean;
  enabledAt: string | null;
}) {
  return enabled ? <EnabledView enabledAt={enabledAt} /> : <SetupView />;
}

function SetupView() {
  const router = useRouter();
  const [setup, setSetup] = useState<TotpSetup | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [starting, startTransition] = useTransition();
  const [state, formAction, pending] = useActionState(confirmTotpAction, undefined);

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state?.success, router]);

  if (state?.success) {
    return (
      <p className="rounded-lg bg-emerald-500/15 px-4 py-2 text-sm text-emerald-400">{state.success}</p>
    );
  }

  if (!setup) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Add a second step to your login: after your password you&apos;ll enter a 6-digit code
          from an authenticator app (Google Authenticator, Microsoft Authenticator, Authy, 1Password…).
        </p>
        {startError && (
          <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{startError}</p>
        )}
        <button
          type="button"
          disabled={starting}
          className={primaryButton}
          onClick={() =>
            startTransition(async () => {
              setStartError(null);
              const result = await startTotpSetupAction();
              if (result.setup) setSetup(result.setup);
              else setStartError(result.error ?? "Could not start the setup.");
            })
          }
        >
          {starting ? "Preparing…" : "Set up authenticator app"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-400">
        <li>Open your authenticator app and choose &quot;Add account&quot; / scan a QR code.</li>
        <li>Scan the code below, or type the key manually.</li>
        <li>Enter the 6-digit code the app shows to finish.</li>
      </ol>

      <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-4 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={setup.qrDataUrl} alt="QR code for your authenticator app" width={180} height={180} />
        <div className="text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Manual key</p>
          <code className="mt-1 block break-all font-mono text-sm text-slate-900">{setup.secret}</code>
          <p className="mt-2 text-xs text-slate-500">Type: time-based (TOTP), 6 digits, 30 seconds.</p>
        </div>
      </div>

      <form action={formAction} className="space-y-3">
        {state?.error && (
          <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
        )}
        <div>
          <label className="text-sm font-medium text-slate-200">Code from the app</label>
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            required
            placeholder="123 456"
            className={inputClass}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className={primaryButton}>
            {pending ? "Checking…" : "Turn on two-factor"}
          </button>
          <button
            type="button"
            disabled={pending}
            className={secondaryButton}
            onClick={() =>
              startTransition(async () => {
                await cancelTotpSetupAction();
                setSetup(null);
              })
            }
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function EnabledView({ enabledAt }: { enabledAt: string | null }) {
  const router = useRouter();
  const [showDisable, setShowDisable] = useState(false);
  const [state, formAction, pending] = useActionState(disableTotpAction, undefined);

  useEffect(() => {
    if (state?.success) router.refresh();
  }, [state?.success, router]);

  if (state?.success) {
    return (
      <p className="rounded-lg bg-emerald-500/15 px-4 py-2 text-sm text-emerald-400">{state.success}</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
          Enabled
        </span>
        <span className="text-sm text-slate-400">
          Authenticator app{enabledAt ? ` · since ${new Date(enabledAt).toLocaleDateString()}` : ""}
        </span>
      </div>
      <p className="text-sm text-slate-400">
        Every login asks for a code from your app after the password. If you lose your device,
        contact support to have it reset.
      </p>

      {!showDisable ? (
        <button type="button" className={secondaryButton} onClick={() => setShowDisable(true)}>
          Turn off two-factor
        </button>
      ) : (
        <form action={formAction} className="space-y-3 rounded-lg border border-red-500/30 p-4">
          {state?.error && (
            <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
          )}
          <div>
            <label className="text-sm font-medium text-slate-200">Confirm with your password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-red-500/80 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
            >
              {pending ? "Turning off…" : "Turn off"}
            </button>
            <button
              type="button"
              disabled={pending}
              className={secondaryButton}
              onClick={() => setShowDisable(false)}
            >
              Keep it on
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
