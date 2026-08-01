"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";
import { generateBookingReference, nightsBetween } from "@/lib/format";
import { signQrPayload, verifyQrPayload } from "@/lib/qr-sign";
import { ID_TYPES, PAYMENT_METHODS } from "@/lib/constants";

type Result = { ok: boolean; error?: string; reference?: string };

export interface LookupBooking {
  id: string;
  reference: string;
  status: string;
  guest_name: string | null;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  total_amount: number;
  guests_count: number;
  room: string;
  paymentMode: string;
}

export async function lookupByReference(
  rawRef: string
): Promise<{ ok: boolean; error?: string; booking?: LookupBooking }> {
  await requireRole(["receptionist", "admin", "owner"]);

  // Accept a scanned QR payload (signed JSON) or a manually-typed reference.
  const verified = verifyQrPayload(rawRef);
  if (!verified.ref) {
    return { ok: false, error: "Unrecognised code. Scan a valid booking QR or enter a reference." };
  }
  // A scanned QR with a bad/missing signature is likely forged — reject it.
  if (!verified.manual && !verified.valid) {
    return {
      ok: false,
      error: "This QR code failed verification — it may be forged or altered. Verify the guest's ID and look up the reference manually.",
    };
  }
  const reference = verified.ref;

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      "id, reference, status, guest_name, guest_phone, check_in, check_out, total_amount, guests_count, payment_mode, rooms(room_number, room_type)"
    )
    .eq("reference", reference.toUpperCase())
    .maybeSingle();

  if (!data) return { ok: false, error: "No booking found for that reference." };
  const b = data as unknown as {
    id: string;
    reference: string;
    status: string;
    guest_name: string | null;
    guest_phone: string | null;
    check_in: string;
    check_out: string;
    total_amount: number;
    guests_count: number;
    payment_mode: string;
    rooms?: { room_number: string; room_type: string } | null;
  };

  return {
    ok: true,
    booking: {
      id: b.id,
      reference: b.reference,
      status: b.status,
      guest_name: b.guest_name,
      guest_phone: b.guest_phone,
      check_in: b.check_in,
      check_out: b.check_out,
      total_amount: b.total_amount,
      guests_count: b.guests_count,
      room: b.rooms ? `${b.rooms.room_type} · Room ${b.rooms.room_number}` : "—",
      paymentMode: b.payment_mode,
    },
  };
}

async function loadBooking(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return { supabase, booking: data as Record<string, unknown> | null };
}

export async function checkInBooking(id: string): Promise<Result> {
  const profile = await requireRole(["receptionist", "admin", "owner"]);
  const { supabase, booking } = await loadBooking(id);
  if (!booking) return { ok: false, error: "Booking not found" };
  if (!["Reserved", "Confirmed"].includes(booking.status as string)) {
    return { ok: false, error: `Cannot check in a ${booking.status} booking.` };
  }
  await supabase.from("bookings").update({ status: "Checked-In" } as never).eq("id", id);
  await supabase.from("rooms").update({ status: "Occupied" } as never).eq("id", booking.room_id as string);
  await logAudit({ actorId: profile.id, action: "booking.checked_in", entity: "bookings", entityId: id });
  revalidatePath("/reception");
  return { ok: true };
}

export async function checkOutBooking(id: string): Promise<Result> {
  const profile = await requireRole(["receptionist", "admin", "owner"]);
  const { supabase, booking } = await loadBooking(id);
  if (!booking) return { ok: false, error: "Booking not found" };
  if (booking.status !== "Checked-In") {
    return { ok: false, error: "Only checked-in guests can be checked out." };
  }
  await supabase.from("bookings").update({ status: "Checked-Out" } as never).eq("id", id);
  await supabase.from("rooms").update({ status: "Cleaning" } as never).eq("id", booking.room_id as string);

  await logAudit({ actorId: profile.id, action: "booking.checked_out", entity: "bookings", entityId: id });
  revalidatePath("/reception");
  return { ok: true };
}

export async function markNoShow(id: string): Promise<Result> {
  const profile = await requireRole(["receptionist", "admin", "owner"]);
  const { supabase, booking } = await loadBooking(id);
  if (!booking) return { ok: false, error: "Booking not found" };
  await supabase.from("bookings").update({ status: "No Show" } as never).eq("id", id);
  await supabase
    .from("rooms")
    .update({ status: "Available" } as never)
    .eq("id", booking.room_id as string)
    .eq("status", "Reserved");
  await logAudit({ actorId: profile.id, action: "booking.no_show", entity: "bookings", entityId: id });
  revalidatePath("/reception");
  return { ok: true };
}

const RELEASABLE = ["Pending", "Awaiting Payment", "Reserved"];

/**
 * Manually release an unpaid hold (staff decision — there is no automatic
 * expiry). Cancels the booking, frees any held room, and fails any pending
 * online payment. Paid/Confirmed bookings are not releasable here (those go
 * through cancellation/refund).
 */
export async function releaseHold(id: string): Promise<Result> {
  const profile = await requireRole(["receptionist", "admin", "owner"]);
  const { supabase, booking } = await loadBooking(id);
  if (!booking) return { ok: false, error: "Booking not found" };
  if (!RELEASABLE.includes(booking.status as string)) {
    return { ok: false, error: `A ${booking.status} booking can't be released here.` };
  }

  await supabase.from("bookings").update({ status: "Cancelled" } as never).eq("id", id);
  await supabase
    .from("rooms")
    .update({ status: "Available" } as never)
    .eq("id", booking.room_id as string)
    .eq("status", "Reserved");
  await supabase
    .from("booking_payments")
    .update({ status: "failed" } as never)
    .eq("booking_id", id)
    .eq("status", "pending");

  await logAudit({ actorId: profile.id, action: "booking.hold_released", entity: "bookings", entityId: id });
  revalidatePath("/reception");
  return { ok: true };
}

const paymentSchema = z.object({
  bookingId: z.string().uuid(),
  method: z.enum(PAYMENT_METHODS),
  amount: z.coerce.number().min(0),
});

export async function recordPayment(formData: FormData): Promise<Result> {
  const profile = await requireRole(["receptionist", "admin", "owner"]);
  const parsed = paymentSchema.safeParse({
    bookingId: formData.get("bookingId"),
    method: formData.get("method"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid payment details" };

  const supabase = await createClient();
  const { error } = await supabase.from("booking_payments").insert({
    booking_id: parsed.data.bookingId,
    method: parsed.data.method,
    amount: parsed.data.amount,
    status: "success",
    paid_at: new Date().toISOString(),
    recorded_by: profile.id,
  } as never);
  if (error) return { ok: false, error: error.message };

  // A booking left at "Awaiting Payment" (guest chose direct MoMo) is only held,
  // not confirmed. Recording enough money is what settles it, so promote it here
  // — otherwise it would sit in the hold queue and risk being released.
  const { booking } = await loadBooking(parsed.data.bookingId);
  if (booking && booking.status === "Awaiting Payment") {
    const { data: payments } = await supabase
      .from("booking_payments")
      .select("amount")
      .eq("booking_id", parsed.data.bookingId)
      .eq("status", "success");
    const settled = (payments ?? []).reduce(
      (sum, p) => sum + Number((p as { amount: number }).amount),
      0
    );
    if (settled >= Number(booking.total_amount)) {
      await supabase
        .from("bookings")
        .update({ status: "Confirmed", hold_expires_at: null } as never)
        .eq("id", parsed.data.bookingId);
    }
  }

  await logAudit({
    actorId: profile.id,
    action: "payment.recorded",
    entity: "bookings",
    entityId: parsed.data.bookingId,
    metadata: { method: parsed.data.method, amount: parsed.data.amount },
  });
  revalidatePath("/reception");
  return { ok: true };
}

export async function transferRoom(bookingId: string, newRoomId: string): Promise<Result> {
  const profile = await requireRole(["receptionist", "admin", "owner"]);
  const { supabase, booking } = await loadBooking(bookingId);
  if (!booking) return { ok: false, error: "Booking not found" };

  const { data: newRoomData } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", newRoomId)
    .maybeSingle();
  const newRoom = newRoomData as { price_per_night: number; status: string } | null;
  if (!newRoom) return { ok: false, error: "Target room not found" };
  if (!["Available", "Cleaning"].includes(newRoom.status)) {
    return { ok: false, error: "Target room isn't available." };
  }

  const nights = nightsBetween(booking.check_in as string, booking.check_out as string);
  const newTotal = nights * newRoom.price_per_night;
  const occupied = booking.status === "Checked-In";

  await supabase
    .from("bookings")
    .update({ room_id: newRoomId, total_amount: newTotal } as never)
    .eq("id", bookingId);
  await supabase
    .from("rooms")
    .update({ status: occupied ? "Occupied" : "Reserved" } as never)
    .eq("id", newRoomId);
  // Free the old room: needs cleaning only if the guest had occupied it.
  await supabase
    .from("rooms")
    .update({ status: occupied ? "Cleaning" : "Available" } as never)
    .eq("id", booking.room_id as string);

  await logAudit({
    actorId: profile.id,
    action: "booking.room_transfer",
    entity: "bookings",
    entityId: bookingId,
    metadata: { from: booking.room_id, to: newRoomId, newTotal },
  });
  revalidatePath("/reception");
  return { ok: true };
}

const walkInSchema = z.object({
  guestName: z.string().min(2),
  phone: z.string().min(7),
  idType: z.enum(ID_TYPES),
  idNumber: z.string().min(2),
  roomId: z.string().uuid(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.coerce.number().int().min(1),
  method: z.enum(PAYMENT_METHODS),
});

export async function createWalkIn(formData: FormData): Promise<Result> {
  const profile = await requireRole(["receptionist", "admin", "owner"]);
  const parsed = walkInSchema.safeParse({
    guestName: formData.get("guestName"),
    phone: formData.get("phone"),
    idType: formData.get("idType"),
    idNumber: formData.get("idNumber"),
    roomId: formData.get("roomId"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    guests: formData.get("guests"),
    method: formData.get("method"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const input = parsed.data;

  const supabase = await createClient();
  const { data: roomData } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", input.roomId)
    .maybeSingle();
  const room = roomData as { room_number: string; room_type: string; price_per_night: number; capacity: number; status: string } | null;
  if (!room) return { ok: false, error: "Room not found" };

  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights < 1) return { ok: false, error: "Check-out must be after check-in." };
  const total = nights * room.price_per_night;
  const reference = generateBookingReference();
  const qrPayload = signQrPayload({
    ref: reference,
    guest: input.guestName,
    room: `${room.room_type} · ${room.room_number}`,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
  });

  const { data: inserted, error } = await supabase
    .from("bookings")
    .insert({
      reference,
      room_id: input.roomId,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guests_count: input.guests,
      total_amount: total,
      currency: "GHS",
      payment_mode: "pay_at_hotel",
      status: "Checked-In",
      source: "walk_in",
      qr_payload: qrPayload,
      guest_name: input.guestName,
      guest_phone: input.phone,
    } as never)
    .select("id")
    .single();
  if (error || !inserted) {
    if (error?.code === "23P01") {
      return { ok: false, error: "That room is already booked for those dates." };
    }
    return { ok: false, error: error?.message ?? "Failed" };
  }
  const bookingId = (inserted as { id: string }).id;

  await supabase.from("guest_identifications").insert({
    booking_id: bookingId,
    full_name: input.guestName,
    phone: input.phone,
    id_type: input.idType,
    id_number: input.idNumber,
    created_by: profile.id,
  } as never);

  await supabase.from("booking_payments").insert({
    booking_id: bookingId,
    method: input.method,
    amount: total,
    status: "success",
    paid_at: new Date().toISOString(),
    recorded_by: profile.id,
  } as never);

  await supabase.from("rooms").update({ status: "Occupied" } as never).eq("id", input.roomId);

  await logAudit({
    actorId: profile.id,
    action: "walkin.created",
    entity: "bookings",
    entityId: bookingId,
    metadata: { reference, total },
  });
  revalidatePath("/reception");
  return { ok: true, reference };
}
