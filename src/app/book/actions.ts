"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializeTransaction } from "@/lib/services/paystack";
import { sendBookingConfirmation } from "@/lib/services/notify";
import { generateBookingReference, nightsBetween } from "@/lib/format";
import { signQrPayload } from "@/lib/qr-sign";
import type { Room } from "@/lib/supabase/types";

const schema = z.object({
  roomId: z.string().uuid(),
  checkIn: z.string(),
  checkOut: z.string(),
  guests: z.coerce.number().int().min(1),
  guestName: z.string().min(2),
  guestPhone: z.string().min(7),
  guestEmail: z.string().email().optional().or(z.literal("")),
  paymentMode: z.enum(["pay_now", "momo_direct", "pay_at_hotel"]),
});

export type CreateBookingResult =
  | { ok: true; redirect: string; external: boolean }
  | { ok: false; error: string };

export async function createBooking(
  formData: FormData
): Promise<CreateBookingResult> {
  const parsed = schema.safeParse({
    roomId: formData.get("roomId"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    guests: formData.get("guests"),
    guestName: formData.get("guestName"),
    guestPhone: formData.get("guestPhone"),
    guestEmail: formData.get("guestEmail"),
    paymentMode: formData.get("paymentMode"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form" };
  }
  const input = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to complete your booking." };

  // Load room (and price) — trust server price, not client.
  const { data: roomData } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", input.roomId)
    .maybeSingle();
  const room = roomData as Room | null;
  if (!room || !room.is_active) return { ok: false, error: "Room not available." };

  if (input.guests > room.capacity) {
    return { ok: false, error: `This room sleeps up to ${room.capacity} guests.` };
  }

  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights < 1) return { ok: false, error: "Select at least one night." };

  // Availability re-check (overlap with blocking statuses)
  const { data: conflicts } = await supabase
    .from("bookings")
    .select("id")
    .eq("room_id", room.id)
    .in("status", ["Awaiting Payment", "Reserved", "Confirmed", "Checked-In"])
    .lt("check_in", input.checkOut)
    .gt("check_out", input.checkIn);
  if (conflicts && conflicts.length > 0) {
    return { ok: false, error: "Sorry, this room was just booked for those dates." };
  }

  const total = nights * room.price_per_night;
  const reference = generateBookingReference();
  const qrPayload = signQrPayload({
    ref: reference,
    guest: input.guestName,
    room: `${room.room_type} · ${room.room_number}`,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
  });

  // Hold window for the modes that leave the room held without money upfront.
  let holdExpiresAt: string | null = null;
  if (input.paymentMode === "pay_at_hotel" || input.paymentMode === "momo_direct") {
    const { data: settings } = await supabase
      .from("hotel_settings")
      .select("reservation_hold_hours")
      .eq("id", 1)
      .maybeSingle();
    const hours = (settings as { reservation_hold_hours?: number } | null)?.reservation_hold_hours ?? 24;
    holdExpiresAt = new Date(Date.now() + hours * 3600_000).toISOString();
  }

  // momo_direct holds the room while the guest transfers, but stays short of
  // Reserved until reception confirms the money actually landed.
  const status =
    input.paymentMode === "pay_now"
      ? "Pending"
      : input.paymentMode === "momo_direct"
        ? "Awaiting Payment"
        : "Reserved";

  // Bookings are created with the service role (RLS forbids direct guest writes);
  // every value here is validated/derived server-side, guest_id is the auth'd user.
  const admin = createAdminClient();
  const { data: inserted, error: insertErr } = await admin
    .from("bookings")
    .insert({
      reference,
      guest_id: user.id,
      room_id: room.id,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guests_count: input.guests,
      total_amount: total,
      currency: "GHS",
      payment_mode: input.paymentMode,
      status,
      source: "online",
      hold_expires_at: holdExpiresAt,
      qr_payload: qrPayload,
      guest_name: input.guestName,
      guest_phone: input.guestPhone,
      guest_email: input.guestEmail || null,
    } as never)
    .select("id, reference")
    .single();

  if (insertErr || !inserted) {
    // 23P01 = exclusion constraint violation → room taken for those dates.
    if (insertErr?.code === "23P01") {
      return { ok: false, error: "Sorry, this room was just booked for those dates." };
    }
    console.error("createBooking insert", insertErr?.message);
    return { ok: false, error: "Could not create your booking. Please try again." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (input.paymentMode === "pay_now") {
    const email = input.guestEmail || user.email || `${reference}@guest.mountpatrick`;
    await admin.from("booking_payments").insert({
      booking_id: (inserted as { id: string }).id,
      method: "paystack",
      amount: total,
      status: "pending",
      provider_reference: reference,
    } as never);

    try {
      const { authorizationUrl } = await initializeTransaction({
        email,
        amount: total,
        reference,
        callbackUrl: `${siteUrl}/api/payments/paystack/callback`,
        metadata: { booking_reference: reference, room: room.room_number },
      });
      return { ok: true, redirect: authorizationUrl, external: true };
    } catch (err) {
      console.error("paystack init", err);
      return {
        ok: false,
        error:
          "Online payment is unavailable right now. Try 'Pay at Hotel' or contact us.",
      };
    }
  }

  // Direct MoMo → log the expected payment so reception has something to settle
  // against when the guest's transfer lands.
  if (input.paymentMode === "momo_direct") {
    await admin.from("booking_payments").insert({
      booking_id: (inserted as { id: string }).id,
      method: "momo",
      amount: total,
      status: "pending",
      provider_reference: reference,
    } as never);
  }

  // Pay at hotel / direct MoMo → room held, notify now
  await sendBookingConfirmation({
    userId: user.id,
    name: input.guestName,
    phone: input.guestPhone,
    email: input.guestEmail || user.email || null,
    reference,
    roomName: `${room.room_type} · Room ${room.room_number}`,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    total,
    payAtHotel: true,
    momoDue: input.paymentMode === "momo_direct",
  });

  return { ok: true, redirect: `/book/confirmation/${reference}`, external: false };
}
