import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingConfirmation } from "@/lib/services/notify";
import { logAudit } from "@/lib/services/audit";

/**
 * Idempotently mark a pay-now booking as paid & confirmed. Safe to call from
 * both the Paystack webhook and the redirect callback.
 */
export async function confirmPaidBooking(
  reference: string,
  paidAmount?: number
): Promise<{ ok: boolean; alreadyDone?: boolean }> {
  const admin = createAdminClient();

  const { data: booking } = await admin
    .from("bookings")
    .select("*, rooms(room_number, room_type, status)")
    .eq("reference", reference)
    .maybeSingle();

  if (!booking) return { ok: false };

  type B = {
    id: string;
    status: string;
    guest_id: string | null;
    guest_name: string | null;
    guest_phone: string | null;
    guest_email: string | null;
    check_in: string;
    check_out: string;
    total_amount: number;
    room_id: string;
    rooms?: { room_number: string; room_type: string; status: string } | null;
  };
  const b = booking as unknown as B;

  if (b.status === "Confirmed" || b.status === "Checked-In" || b.status === "Checked-Out") {
    return { ok: true, alreadyDone: true };
  }

  await admin
    .from("bookings")
    .update({ status: "Confirmed" } as never)
    .eq("id", b.id);

  // Payment ledger → success (update existing pending, else insert)
  const { data: existing } = await admin
    .from("booking_payments")
    .select("id")
    .eq("provider_reference", reference)
    .maybeSingle();

  if (existing) {
    await admin
      .from("booking_payments")
      .update({ status: "success", paid_at: new Date().toISOString() } as never)
      .eq("id", (existing as { id: string }).id);
  } else {
    await admin.from("booking_payments").insert({
      booking_id: b.id,
      method: "paystack",
      amount: paidAmount ?? b.total_amount,
      status: "success",
      provider_reference: reference,
      paid_at: new Date().toISOString(),
    } as never);
  }

  // Reserve the room for the stay
  await admin
    .from("rooms")
    .update({ status: "Reserved" } as never)
    .eq("id", b.room_id)
    .eq("status", "Available");

  const roomName = b.rooms
    ? `${b.rooms.room_type} · Room ${b.rooms.room_number}`
    : "Your room";

  await sendBookingConfirmation({
    userId: b.guest_id,
    name: b.guest_name ?? "Guest",
    phone: b.guest_phone,
    email: b.guest_email,
    reference,
    roomName,
    checkIn: b.check_in,
    checkOut: b.check_out,
    total: b.total_amount,
    payAtHotel: false,
  });

  await logAudit({
    actorId: b.guest_id,
    action: "booking.paid",
    entity: "bookings",
    entityId: b.id,
    metadata: { reference, amount: paidAmount ?? b.total_amount },
  });

  return { ok: true };
}
