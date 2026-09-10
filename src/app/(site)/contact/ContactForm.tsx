"use client";

import { useActionState } from "react";
import { contactAction } from "@/lib/actions/contact";
import Turnstile from "@/components/Turnstile";

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none";

export default function ContactForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [state, formAction, pending] = useActionState(contactAction, undefined);

  if (state?.success) {
    return (
      <div className="rounded-xl bg-emerald-500/10 p-6 text-center">
        <p className="text-2xl">✅</p>
        <p className="mt-2 font-semibold text-emerald-400">Message sent</p>
        <p className="mt-1 text-sm text-slate-300">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{state.error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-200">Your name</label>
          <input name="name" required maxLength={120} className={inputClass} placeholder="John Smith" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-200">Email address</label>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-200">Subject</label>
          <select name="subject" className={inputClass} defaultValue="Question about an order">
            <option>Question about an order</option>
            <option>Payment or billing</option>
            <option>Refund request</option>
            <option>API access</option>
            <option>Account or login</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-200">
            Order ID <span className="text-slate-500">(optional)</span>
          </label>
          <input name="orderId" maxLength={60} className={inputClass} placeholder="e.g. 1234" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-200">Message</label>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={4000}
          className={inputClass}
          placeholder="How can we help?"
        />
      </div>
      {turnstileSiteKey && <Turnstile siteKey={turnstileSiteKey} />}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
