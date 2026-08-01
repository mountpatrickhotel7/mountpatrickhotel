import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/services/paystack";
import { confirmPaidBooking } from "@/lib/services/booking-confirm";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; amount?: number } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    await confirmPaidBooking(
      event.data.reference,
      event.data.amount ? event.data.amount / 100 : undefined
    );
  }

  return NextResponse.json({ received: true });
}
