import Link from "next/link";
import { BookingList, type ListBooking } from "@/components/reception/booking-list";
import { DashboardTitle } from "@/components/dashboard/stat-card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUSES } from "@/lib/constants";

const SELECT =
  "id, reference, status, guest_name, check_in, check_out, total_amount, guests_count, source, hold_expires_at, rooms(room_number, room_type)";

export async function AllBookings({
  basePath,
  status,
}: {
  basePath: string;
  status?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(200);
  if (status && (BOOKING_STATUSES as readonly string[]).includes(status)) {
    query = query.eq("status", status);
  }

  const [{ data }, { data: avail }] = await Promise.all([
    query,
    supabase
      .from("rooms")
      .select("id, room_number, room_type")
      .eq("status", "Available")
      .order("room_number"),
  ]);

  const bookings = (data ?? []) as unknown as ListBooking[];
  const rooms = (avail ?? []).map((r) => {
    const room = r as { id: string; room_number: string; room_type: string };
    return { id: room.id, label: `${room.room_type} · Room ${room.room_number}` };
  });

  const filters = ["All", ...BOOKING_STATUSES];

  return (
    <>
      <DashboardTitle
        title="Reservations"
        description="Search, check in, check out, take payment, and transfer rooms."
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (f === "All" && !status) || f === status;
          const href = f === "All" ? basePath : `${basePath}?status=${encodeURIComponent(f)}`;
          return (
            <Link
              key={f}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-gold bg-gold/15 text-foreground"
                  : "border-border text-muted-foreground hover:border-gold/50"
              )}
            >
              {f}
            </Link>
          );
        })}
      </div>
      <BookingList bookings={bookings} rooms={rooms} emptyLabel="No reservations match this filter." />
    </>
  );
}
