"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { startCheckoutAction } from "@/lib/actions/checkout";
import { normalizeLink, priceFor, type PlatformSection, type ServiceType } from "@/lib/packages";
import { PLATFORMS, type PlatformKey } from "@/lib/catalog";

export type Viewer = { signedIn: boolean; email: string | null; balance: number };

export type CheckoutRequest = { platform: PlatformKey; typeKey: string; quantity: number };

const STEPS = [
  { key: "service", icon: "🛍️", label: "Service" },
  { key: "link", icon: "@", label: "Profile" },
  { key: "email", icon: "👤", label: "Email" },
  { key: "pay", icon: "💳", label: "Payment" },
] as const;

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none";

export default function CheckoutModal({
  sections,
  viewer,
  request,
  onClose,
}: {
  sections: PlatformSection[];
  viewer: Viewer;
  request: CheckoutRequest | null;
  onClose: () => void;
}) {
  const open = request !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!request) return null;
  // Remount the wizard for every new request so its state starts fresh.
  const key = `${request.platform}:${request.typeKey}:${request.quantity}`;
  return <Wizard key={key} sections={sections} viewer={viewer} request={request} onClose={onClose} />;
}

function Wizard({
  sections,
  viewer,
  request,
  onClose,
}: {
  sections: PlatformSection[];
  viewer: Viewer;
  request: CheckoutRequest;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [platform] = useState<PlatformKey>(request.platform);
  const [typeKey, setTypeKey] = useState(request.typeKey);
  const [quantity, setQuantity] = useState(request.quantity);
  const [confirmedQty, setConfirmedQty] = useState<number | null>(request.quantity);
  const [linkInput, setLinkInput] = useState("");
  const [email, setEmail] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const section = useMemo(() => sections.find((s) => s.key === platform), [sections, platform]);
  const types: ServiceType[] = section?.types ?? [];
  const type = types.find((t) => t.key === typeKey) ?? types[0];
  const service = type?.service;
  const platformMeta = PLATFORMS.find((p) => p.key === platform);
  const price = service && confirmedQty ? priceFor(service.rate, confirmedQty) : 0;
  const link = normalizeLink(platform, linkInput);
  const stepsToShow = viewer.signedIn ? STEPS.filter((s) => s.key !== "email") : STEPS;
  const currentKey = stepsToShow[step]?.key ?? "service";

  if (!section || !type || !service) return null;

  function confirmQuantity() {
    if (!service) return;
    const q = Math.floor(quantity);
    if (!Number.isFinite(q) || q < service.min || q > service.max) {
      setError(`Quantity must be between ${service.min.toLocaleString("en-US")} and ${service.max.toLocaleString("en-US")}.`);
      setConfirmedQty(null);
      return;
    }
    setError(null);
    setConfirmedQty(q);
  }

  function next() {
    setError(null);
    if (currentKey === "service") {
      if (!confirmedQty) {
        confirmQuantity();
        if (!confirmedQty) return;
      }
    }
    if (currentKey === "link" && !/^https?:\/\/\S+$/i.test(link)) {
      setError("Enter your username or the full link to your profile / post.");
      return;
    }
    if (currentKey === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("Enter a valid email address.");
        return;
      }
      if (!acceptTerms) {
        setError("Please accept the Terms, Privacy Policy and Refund Policy.");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, stepsToShow.length - 1));
  }

  function pay() {
    if (!service || !confirmedQty) return;
    setError(null);
    startTransition(async () => {
      const result = await startCheckoutAction({
        serviceId: service.id,
        quantity: confirmedQty,
        link,
        email: viewer.signedIn ? undefined : email.trim(),
        acceptTerms,
      });
      if (result.status === "redirect") {
        window.location.href = result.url;
      } else if (result.status === "placed") {
        setPlacedOrderId(result.orderId);
      } else {
        setError(result.error);
      }
    });
  }

  const outstanding = Math.max(0, Math.round((price - (viewer.signedIn ? viewer.balance : 0)) * 100) / 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f0b1a] shadow-2xl"
      >
        {/* Step header */}
        <div className="relative bg-gradient-to-r from-brand to-brand-dark px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-3 text-2xl leading-none text-white/80 hover:text-white"
          >
            ×
          </button>
          <ol className="flex items-center justify-between gap-2 pr-8">
            {stepsToShow.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.key} className="flex flex-1 items-center gap-2">
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 text-base ${
                      active
                        ? "border-white bg-white text-brand"
                        : done
                          ? "border-white/80 bg-white/20 text-white"
                          : "border-white/40 bg-white/10 text-white/60"
                    }`}
                  >
                    {done ? "✓" : s.icon}
                  </div>
                  <span className={`hidden text-xs font-semibold sm:block ${active ? "text-white" : "text-white/70"}`}>
                    {s.label}
                  </span>
                  {i < stepsToShow.length - 1 && <div className="mx-1 hidden h-px flex-1 bg-white/30 sm:block" />}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="space-y-5 p-6">
          {placedOrderId ? (
            <div className="space-y-4 text-center">
              <div className="text-4xl">🎉</div>
              <h3 className="text-xl font-bold text-foreground">Order placed!</h3>
              <p className="text-sm text-slate-300">
                {confirmedQty?.toLocaleString("en-US")} {type.label} for{" "}
                <span className="text-slate-100">{link}</span> is being processed. Order ID:{" "}
                <code className="text-brand">{placedOrderId}</code>
              </p>
              <Link
                href="/dashboard/orders"
                className="inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Track your order
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <p className="rounded-lg bg-red-500/15 px-4 py-2 text-sm text-red-400">{error}</p>
              )}

              {currentKey === "service" && (
                <>
                  <p className="rounded-lg bg-brand/15 px-4 py-2.5 text-sm text-slate-200">
                    ℹ️ Choose a service and enter the quantity, then press OK to see the price.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-200">Service</label>
                      <select
                        value={type.key}
                        onChange={(e) => {
                          setTypeKey(e.target.value);
                          setConfirmedQty(null);
                        }}
                        className={inputClass}
                      >
                        {types.map((t) => (
                          <option key={t.key} value={t.key}>
                            {platformMeta?.label} {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-200">Quantity</label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="number"
                          min={service.min}
                          max={service.max}
                          value={quantity || ""}
                          onChange={(e) => {
                            setQuantity(Number(e.target.value));
                            setConfirmedQty(null);
                          }}
                          placeholder="Type here…"
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-slate-500 focus:border-brand focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={confirmQuantity}
                          className="rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
                        >
                          OK
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Min {service.min.toLocaleString("en-US")} · Max {service.max.toLocaleString("en-US")}
                      </p>
                    </div>
                  </div>

                  {confirmedQty && (
                    <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
                      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                        <div className="bg-brand py-2 text-center text-sm font-bold text-white">
                          €{price.toFixed(2)}
                        </div>
                        <div className="grid place-items-center bg-brand/70 py-6 text-5xl">
                          {platformMeta?.icon}
                        </div>
                        <ul className="space-y-1 px-3 py-3 text-xs text-slate-300">
                          <li className="flex justify-between"><span>Quantity</span><em>{confirmedQty.toLocaleString("en-US")}</em></li>
                          <li className="flex justify-between"><span>Quality</span><em>High</em></li>
                          <li className="flex justify-between"><span>Support</span><em>24/7</em></li>
                          <li className="flex justify-between"><span>Password required</span><em>No</em></li>
                        </ul>
                        <div className="px-3 pb-3">
                          <button
                            type="button"
                            onClick={next}
                            className="w-full rounded-lg bg-amber-400 py-2 text-sm font-bold text-black hover:bg-amber-300"
                          >
                            SELECT »
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-slate-300">
                        <p className="font-semibold text-foreground">{service.name}</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-400">
                          Processing usually starts within minutes; some services can take a few hours.
                          Delivery is gradual and safe, no password is ever needed, and every order is
                          covered by our Refund Policy.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {currentKey === "link" && (
                <>
                  <p className="rounded-lg bg-brand/15 px-4 py-2.5 text-sm text-slate-200">
                    ℹ️ Your profile or post must be public for the duration of the service.
                  </p>
                  <div>
                    <label className="text-sm font-medium text-slate-200">
                      {platformMeta?.label} username or link
                    </label>
                    <input
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      placeholder={`@username or https://…`}
                      autoFocus
                      className={inputClass}
                    />
                    {link && (
                      <p className="mt-1 break-all text-xs text-slate-500">Will be delivered to: {link}</p>
                    )}
                  </div>
                </>
              )}

              {currentKey === "email" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-foreground">Where should we send your order confirmation?</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      No account needed — we&apos;ll email your confirmation and a link to track the order.
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-200">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoFocus
                      className={inputClass}
                    />
                  </div>
                  <label className="flex items-start gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4"
                    />
                    <span>
                      I accept the{" "}
                      <Link href="/terms" target="_blank" className="text-brand hover:underline">Terms</Link>,{" "}
                      <Link href="/privacy" target="_blank" className="text-brand hover:underline">Privacy Policy</Link>{" "}
                      and <Link href="/refund-policy" target="_blank" className="text-brand hover:underline">Refund Policy</Link>.
                    </span>
                  </label>
                  <p className="text-center text-xs text-slate-500">
                    🔒 Secure checkout. We never share your email. Have an account?{" "}
                    <Link href="/login" className="text-brand hover:underline">Log in</Link>
                    {" · "}
                    <Link href="/register" className="text-brand hover:underline">Create account</Link>
                  </p>
                </div>
              )}

              {currentKey === "pay" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                    <div className="flex justify-between text-slate-300"><span>Service</span><span className="text-right text-slate-100">{platformMeta?.label} {type.label}</span></div>
                    <div className="mt-2 flex justify-between text-slate-300"><span>Quantity</span><span className="text-slate-100">{confirmedQty?.toLocaleString("en-US")}</span></div>
                    <div className="mt-2 flex justify-between gap-4 text-slate-300"><span>Deliver to</span><span className="break-all text-right text-slate-100">{link}</span></div>
                    {!viewer.signedIn && (
                      <div className="mt-2 flex justify-between text-slate-300"><span>Email</span><span className="text-slate-100">{email.trim()}</span></div>
                    )}
                    {viewer.signedIn && viewer.balance > 0 && (
                      <div className="mt-2 flex justify-between text-slate-300"><span>Paid from balance</span><span className="text-slate-100">€{Math.min(viewer.balance, price).toFixed(2)}</span></div>
                    )}
                    <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-base font-bold text-foreground">
                      <span>Total</span><span className="text-brand">€{price.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={pay}
                    disabled={pending}
                    className="w-full rounded-lg bg-brand py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    {pending
                      ? "Please wait…"
                      : outstanding > 0
                        ? `Pay €${outstanding.toFixed(2)} with card`
                        : "Place order"}
                  </button>
                  <p className="text-center text-xs text-slate-500">
                    🔒 Card payments are processed securely by Viva Wallet. You&apos;ll be redirected to complete the payment.
                  </p>
                </div>
              )}

              {/* Footer nav */}
              {currentKey !== "pay" && !(currentKey === "service" && !confirmedQty) && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setStep((s) => Math.max(0, s - 1));
                      }}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
                    >
                      Back
                    </button>
                  )}
                  {currentKey !== "service" && (
                    <button
                      type="button"
                      onClick={next}
                      className="rounded-lg bg-brand px-5 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
                    >
                      {currentKey === "email" ? "Continue to payment" : "Continue"}
                    </button>
                  )}
                </div>
              )}
              {currentKey === "pay" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
                  >
                    Back
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
