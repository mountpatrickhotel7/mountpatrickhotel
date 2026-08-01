import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/services/paystack";
import { confirmPaidBooking } from "@/lib/services/booking-confirm";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(`${origin}/account/bookings`);
  }

  try {
    const result = await verifyTransaction(reference);
    if (result.success) {
      await confirmPaidBooking(reference, result.amount);
    }
  } catch (err) {
    console.error("paystack callback verify", err);
  }

  return NextResponse.redirect(`${origin}/book/confirmation/${reference}`);
}
