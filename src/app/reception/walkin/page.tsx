import { DashboardTitle } from "@/components/dashboard/stat-card";
import { WalkInForm } from "@/components/reception/walk-in-form";
import { createClient } from "@/lib/supabase/server";
import { toISODate } from "@/lib/format";

export const metadata = { title: "Walk-in" };

export default async function WalkInPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rooms")
    .select("id, room_number, room_type, price_per_night, capacity")
    .eq("status", "Available")
    .eq("is_active", true)
    .order("room_number");

  const rooms = (data ?? []).map((r) => {
    const room = r as {
      id: string;
      room_number: string;
      room_type: string;
      price_per_night: number;
      capacity: number;
    };
    return {
      id: room.id,
      label: `${room.room_type} · Room ${room.room_number}`,
      price: room.price_per_night,
      capacity: room.capacity,
    };
  });

  const now = new Date();
  const today = toISODate(now);
  const tomorrow = toISODate(new Date(now.getTime() + 86400_000));

  return (
    <>
      <DashboardTitle
        title="Walk-in Guest"
        description="Register a guest, capture ID, assign a room, take payment, and check in."
      />
      {rooms.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No rooms are currently available for walk-in assignment.
        </p>
      ) : (
        <WalkInForm rooms={rooms} today={today} tomorrow={tomorrow} />
      )}
    </>
  );
}
