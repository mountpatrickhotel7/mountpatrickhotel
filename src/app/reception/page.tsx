import Link from "next/link";
import { LogIn, LogOut, BedDouble, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard, DashboardTitle } from "@/components/dashboard/stat-card";
import { BookingList, type ListBooking } from "@/components/reception/booking-list";
import { createClient } from "@/lib/supabase/server";
import { toISODate } from "@/lib/format";

export const metadata = { title: "Reception" };

const SELECT = "id, reference, status, guest_name, check_in, check_out, total_amount, guests_count, source, hold_expires_at, rooms(room_number, room_type)";

export default async function ReceptionTodayPage() {
  const supabase = await createClient();
  const today = toISODate(new Date());

  const [{ data: arrivals }, { data: departures }, { data: inHouse }, { data: avail }] =
    await Promise.all([
      supabase.from("bookings").select(SELECT).eq("check_in", today).in("status", ["Reserved", "Confirmed"]),
      supabase.from("bookings").select(SELECT).eq("check_out", today).eq("status", "Checked-In"),
      supabase.from("bookings").select(SELECT).eq("status", "Checked-In").order("check_out"),
      supabase.from("rooms").select("id, room_number, room_type, price_per_night").eq("status", "Available").order("room_number"),
    ]);

  const rooms = (avail ?? []).map((r) => {
    const room = r as { id: string; room_number: string; room_type: string };
    return { id: room.id, label: `${room.room_type} · Room ${room.room_number}` };
  });

  const a = (arrivals ?? []) as unknown as ListBooking[];
  const d = (departures ?? []) as unknown as ListBooking[];
  const h = (inHouse ?? []) as unknown as ListBooking[];

  return (
    <>
      <DashboardTitle
        title="Today at the Front Desk"
        description="Arrivals, departures, and in-house guests for today."
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/reception/checkin">Check-in / QR</Link>
            </Button>
            <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90">
              <Link href="/reception/walkin">New walk-in</Link>
            </Button>
          </div>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Arrivals today" value={a.length} icon={LogIn} accent />
        <StatCard label="Departures today" value={d.length} icon={LogOut} accent />
        <StatCard label="In-house" value={h.length} icon={CalendarCheck} />
        <StatCard label="Rooms available" value={rooms.length} icon={BedDouble} />
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold">Arrivals</h2>
          <BookingList bookings={a} rooms={rooms} emptyLabel="No arrivals scheduled today." />
        </section>
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold">Departures</h2>
          <BookingList bookings={d} rooms={rooms} emptyLabel="No departures today." />
        </section>
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold">In-house guests</h2>
          <BookingList bookings={h} rooms={rooms} emptyLabel="No guests currently checked in." />
        </section>
      </div>
    </>
  );
}
