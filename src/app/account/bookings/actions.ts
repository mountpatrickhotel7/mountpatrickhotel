"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/services/audit";

const CANCELLABLE = ["Pending", "Awaiting Payment", "Reserved", "Confirmed"];

export async function cancelBooking(
  bookingId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data } = await supabase
    .from("bookings")
    .select("id, status, room_id, guest_id")
    .eq("id", bookingId)
    .maybeSingle();

  const booking = data as {
    id: string;
    status: string;
    room_id: string;
    guest_id: string | null;
  } | null;

  if (!booking || booking.guest_id !== user.id) {
    return { ok: false, error: "Booking not found" };
  }
  if (!CANCELLABLE.includes(booking.status)) {
    return { ok: false, error: `A ${booking.status} booking can't be cancelled here.` };
  }

  // Ownership verified above; the write uses the service role since RLS forbids
  // direct guest booking updates.
  const admin = createAdminClient();
  const { error } = await admin
    .from("bookings")
    .update({ status: "Cancelled" } as never)
    .eq("id", bookingId);
  if (error) return { ok: false, error: error.message };

  // Release the room if it was held for this reservation.
  await admin
    .from("rooms")
    .update({ status: "Available" } as never)
    .eq("id", booking.room_id)
    .eq("status", "Reserved");

  await logAudit({
    actorId: user.id,
    action: "booking.cancelled",
    entity: "bookings",
    entityId: bookingId,
  });

  revalidatePath("/account/bookings");
  return { ok: true };
}
