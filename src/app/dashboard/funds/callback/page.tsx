import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { confirmVivaPayment } from "@/lib/viva-confirm";
import { VivaError } from "@/lib/providers/viva";

export default async function VivaCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; s?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { t: transactionId, s: orderCode } = await searchParams;

  let heading = "Payment Failed";
  let message =
    "We couldn't confirm your payment. If you were charged, please contact support with your order reference.";

  if (transactionId && orderCode) {
    try {
      const result = await confirmVivaPayment(orderCode, transactionId);
      switch (result.status) {
        case "confirmed":
          heading = "Payment Successful 🎉";
          message = `€${result.amount.toFixed(2)} was added to your balance.`;
          break;
        case "already-confirmed":
          heading = "Payment Successful 🎉";
          message = `Payment already confirmed — €${result.amount.toFixed(2)} is in your balance.`;
          break;
        case "unpaid":
          heading = "Payment Pending";
          message =
            "Your payment hasn't cleared yet. This can happen with some payment methods — your balance will update automatically once it's confirmed.";
          break;
        case "mismatch":
        case "not-found":
          // fall through to default failure message
          break;
      }
    } catch (err) {
      heading = "Verification Error";
      message =
        err instanceof VivaError
          ? err.message
          : "We couldn't verify your payment right now. It will be confirmed automatically shortly.";
    }
  }

  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <div className="glass rounded-2xl p-8">
        <h1 className="text-xl font-bold text-foreground">{heading}</h1>
        <p className="mt-3 text-sm text-slate-300">{message}</p>
        <Link
          href="/dashboard/funds"
          className="mt-6 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Back to Add Funds
        </Link>
      </div>
    </div>
  );
}
