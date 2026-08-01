import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Room, RoomImage, RoomTypeEnum } from "@/lib/supabase/types";

export type RoomWithImages = Room & { room_images: RoomImage[] };

export async function getRooms(): Promise<RoomWithImages[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*, room_images(*)")
    .eq("is_active", true)
    .order("price_per_night", { ascending: true });
  if (error) {
    console.error("getRooms", error.message);
    return [];
  }
  return (data ?? []) as RoomWithImages[];
}

export async function getRoomById(id: string): Promise<RoomWithImages | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*, room_images(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getRoomById", error.message);
    return null;
  }
  return (data as unknown as RoomWithImages | null) ?? null;
}

export async function searchAvailableRooms(params: {
  checkIn: string;
  checkOut: string;
  guests?: number;
  roomType?: RoomTypeEnum | null;
}): Promise<RoomWithImages[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_available_rooms", {
    p_check_in: params.checkIn,
    p_check_out: params.checkOut,
    p_guests: params.guests ?? 1,
    p_room_type: params.roomType ?? null,
  } as never);
  if (error) {
    console.error("searchAvailableRooms", error.message);
    return [];
  }
  const rooms = (data ?? []) as Room[];
  if (rooms.length === 0) return [];

  // hydrate images
  const ids = rooms.map((r) => r.id);
  const { data: imgs } = await supabase
    .from("room_images")
    .select("*")
    .in("room_id", ids);
  const byRoom = new Map<string, RoomImage[]>();
  for (const img of (imgs ?? []) as RoomImage[]) {
    const list = byRoom.get(img.room_id) ?? [];
    list.push(img);
    byRoom.set(img.room_id, list);
  }
  return rooms.map((r) => ({ ...r, room_images: byRoom.get(r.id) ?? [] }));
}

export function primaryImage(room: RoomWithImages): string | null {
  if (!room.room_images?.length) return null;
  const primary = room.room_images.find((i) => i.is_primary) ?? room.room_images[0];
  return primary?.storage_path ?? null;
}
