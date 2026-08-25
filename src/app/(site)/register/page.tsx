"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/lib/actions/auth";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-20">
    <div className="glass rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
      <p className="mt-2 text-sm text-slate-400">
        Register in seconds and start growing your social presence.
      </p>

      {state?.error && (
        <p className="mt-4 rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-200">Full name</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-200">Email</label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-200">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 text-foreground placeholder:text-slate-400 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Login
        </Link>
      </p>
    </div>
    </div>
  );
}
