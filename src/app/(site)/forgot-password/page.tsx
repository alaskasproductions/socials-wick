"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, undefined);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-20">
      <div className="glass rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-400">
          Enter your account email and we'll send you a link to reset your password.
        </p>

        {state?.error && (
          <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="mt-4 rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">
            {state.success}
          </p>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-200">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
