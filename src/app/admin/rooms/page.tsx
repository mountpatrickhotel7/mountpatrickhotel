import { DashboardTitle } from "@/components/dashboard/stat-card";
import { RoomsManager } from "@/components/admin/rooms-manager";
import { createClient } from "@/lib/supabase/server";
import type { RoomWithImages } from "@/lib/queries";

export const metadata = { title: "Room Management" };

export default async function AdminRoomsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rooms")
    .select("*, room_images(*)")
    .order("room_number", { ascending: true });
  const rooms = (data ?? []) as unknown as RoomWithImages[];

  return (
    <>
      <DashboardTitle
        title="Room Management"
        description="Create, edit, and manage availability for every room."
      />
      <RoomsManager rooms={rooms} />
    </>
  );
}
