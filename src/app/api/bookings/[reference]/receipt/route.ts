import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bookingReceiptPdf } from "@/lib/services/pdf";
import { nightsBetween } from "@/lib/format";
import { qrPngBuffer } from "@/lib/qr";
import { signQrPayload } from "@/lib/qr-sign";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const supabase = await createClient();

  // RLS ensures only the owner or staff can read this booking.
  const { data } = await supabase
    .from("bookings")
    .select("*, rooms(room_number, room_type)")
    .eq("reference", reference)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  type B = {
    reference: string;
    guest_name: string | null;
    check_in: string;
    check_out: string;
    total_amount: number;
    status: string;
    payment_mode: string;
    qr_payload: string | null;
    rooms?: { room_number: string; room_type: string } | null;
  };
  const b = data as unknown as B;

  const roomName = b.rooms ? `${b.rooms.room_type} · Room ${b.rooms.room_number}` : "Room";
  const payload =
    b.qr_payload ??
    signQrPayload({
      ref: b.reference,
      guest: b.guest_name ?? "Guest",
      room: roomName,
      checkIn: b.check_in,
      checkOut: b.check_out,
    });
  const qr = await qrPngBuffer(payload);

  const pdf = await bookingReceiptPdf({
    reference: b.reference,
    guestName: b.guest_name ?? "Guest",
    roomName,
    checkIn: b.check_in,
    checkOut: b.check_out,
    nights: nightsBetween(b.check_in, b.check_out),
    total: b.total_amount,
    status: b.status,
    paymentMode: b.payment_mode,
    qr,
  });

  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="receipt-${b.reference}.pdf"`,
    },
  });
}
