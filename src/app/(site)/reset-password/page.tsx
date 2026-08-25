"use client";

import { use, useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/actions/auth";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = use(searchParams);
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-20">
      <div className="glass rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-foreground">Set a new password</h1>
        <p className="mt-2 text-sm text-slate-400">
          Choose a new password for your Socials Wick account.
        </p>

        {!token && (
          <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">
            This reset link is missing its token. Request a new one from the{" "}
            <Link href="/forgot-password" className="underline">
              forgot password
            </Link>{" "}
            page.
          </p>
        )}

        {state?.error && (
          <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">
            {state.error}
          </p>
        )}

        {token && (
          <form action={formAction} className="mt-6 space-y-4">
            <input type="hidden" name="token" value={token} />
            <div>
              <label className="text-sm font-medium text-slate-200">New Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-200">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {pending ? "Saving…" : "Reset Password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
