"use client";

import { useActionState } from "react";
import { resendVerificationEmailAction } from "@/lib/actions/auth";

export default function ResendVerificationForm() {
  const [state, formAction, pending] = useActionState(resendVerificationEmailAction, undefined);

  return (
    <form action={formAction}>
      {state?.error && (
        <p className="mb-3 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mb-3 rounded-lg bg-green-500/15 px-4 py-2 text-sm text-green-400">
          {state.success}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Sending…" : "Resend Verification Email"}
      </button>
    </form>
  );
}
