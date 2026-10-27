import { randomBytes } from "crypto";
import { getSettings } from "@/lib/settings";

// Payment methods that are settled by hand: a bank transfer, PayPal, crypto or
// a local method. The customer sees the details plus a short reference, sends
// the money, and an admin approves the request once it arrives.
//
// Configured in Admin → Settings → Payment Gateways. A method with no details
// saved is never offered to customers.

export type ManualMethodKey = "bank" | "paypal" | "crypto" | "other";

export type ManualMethod = {
  key: ManualMethodKey;
  /** Stored on the FundRequest and shown everywhere, e.g. "Bank Transfer". */
  label: string;
  /** Lines of payment details, already formatted for display. */
  lines: { label: string; value: string }[];
  /** Free text under the details. */
  notes: string;
  /** Whether the customer must quote the reference. */
  needsReference: boolean;
};

export const MANUAL_LABELS: Record<ManualMethodKey, string> = {
  bank: "Bank Transfer",
  paypal: "PayPal",
  crypto: "Crypto",
  other: "Other",
};

const KEYS = [
  "manual.bank.enabled",
  "manual.bank.accountHolder",
  "manual.bank.iban",
  "manual.bank.bic",
  "manual.bank.bankName",
  "manual.bank.notes",
  "manual.paypal.enabled",
  "manual.paypal.details",
  "manual.crypto.enabled",
  "manual.crypto.details",
  "manual.other.enabled",
  "manual.other.label",
  "manual.other.details",
];

export type ManualSettings = Record<string, string>;

export async function getManualSettings(): Promise<ManualSettings> {
  return getSettings(KEYS);
}

/** The methods a customer may pick right now, with their details filled in. */
export function manualMethodsFrom(s: ManualSettings): ManualMethod[] {
  const methods: ManualMethod[] = [];

  const iban = (s["manual.bank.iban"] ?? "").trim();
  if (s["manual.bank.enabled"] === "true" && iban) {
    methods.push({
      key: "bank",
      label: MANUAL_LABELS.bank,
      lines: [
        { label: "Account holder", value: (s["manual.bank.accountHolder"] ?? "").trim() },
        { label: "IBAN", value: iban },
        { label: "BIC / SWIFT", value: (s["manual.bank.bic"] ?? "").trim() },
        { label: "Bank", value: (s["manual.bank.bankName"] ?? "").trim() },
      ].filter((l) => l.value),
      notes: (s["manual.bank.notes"] ?? "").trim(),
      needsReference: true,
    });
  }

  const paypal = (s["manual.paypal.details"] ?? "").trim();
  if (s["manual.paypal.enabled"] === "true" && paypal) {
    methods.push({ key: "paypal", label: MANUAL_LABELS.paypal, lines: [], notes: paypal, needsReference: true });
  }

  const crypto = (s["manual.crypto.details"] ?? "").trim();
  if (s["manual.crypto.enabled"] === "true" && crypto) {
    methods.push({ key: "crypto", label: MANUAL_LABELS.crypto, lines: [], notes: crypto, needsReference: false });
  }

  const other = (s["manual.other.details"] ?? "").trim();
  if (s["manual.other.enabled"] === "true" && other) {
    methods.push({
      key: "other",
      label: (s["manual.other.label"] ?? "").trim() || MANUAL_LABELS.other,
      lines: [],
      notes: other,
      needsReference: true,
    });
  }

  return methods;
}

export async function getManualMethods(): Promise<ManualMethod[]> {
  return manualMethodsFrom(await getManualSettings());
}

export function findManualMethod(methods: ManualMethod[], label: string): ManualMethod | undefined {
  return methods.find((m) => m.label === label);
}

/** Short, unambiguous code for the transfer: SW-4F2A9C (no 0/O/1/I). */
export function makePaymentReference(): string {
  const alphabet = "ACDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let code = "";
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `SW-${code}`;
}

/** Plain-text instructions, used in the confirmation email. */
export function instructionsText(method: ManualMethod, amount: number, reference: string): string {
  const lines = [
    `Amount: €${amount.toFixed(2)}`,
    ...method.lines.map((l) => `${l.label}: ${l.value}`),
    ...(method.needsReference ? [`Payment reference: ${reference}`] : []),
  ];
  if (method.notes) lines.push("", method.notes);
  return lines.join("\n");
}
