import { NextRequest, NextResponse } from "next/server";
import { getWebhookVerificationKey } from "@/lib/providers/viva";
import { confirmVivaPayment } from "@/lib/viva-confirm";

const TRANSACTION_PAYMENT_CREATED = 1796;

// Viva GETs this URL once, when you register it in the banking app
// (Settings > API Access > Webhooks), and expects the verification key back.
export async function GET() {
  const key = await getWebhookVerificationKey();
  if (!key) {
    return NextResponse.json(
      { error: "Viva webhook verification key is not configured." },
      { status: 500 }
    );
  }
  return NextResponse.json({ Key: key });
}

// Viva POSTs every subscribed event here. Must always respond 2xx, or Viva
// retries hourly for up to 24 attempts.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || body.EventTypeId !== TRANSACTION_PAYMENT_CREATED) {
    return NextResponse.json({ message: "ignored" });
  }

  const eventData = body.EventData ?? {};
  const orderCode = eventData.OrderCode != null ? String(eventData.OrderCode) : "";
  const transactionId = eventData.TransactionId ? String(eventData.TransactionId) : "";

  if (!orderCode || !transactionId) {
    return NextResponse.json({ message: "missing fields" });
  }

  try {
    await confirmVivaPayment(orderCode, transactionId);
  } catch {
    // Swallow errors here — Viva's own retry policy will redeliver the
    // webhook, and the /dashboard/funds/callback page is a second path to
    // confirmation, so we don't want to trigger 23 retries for a transient
    // issue on our end.
  }

  return NextResponse.json({ message: "ok" });
}
