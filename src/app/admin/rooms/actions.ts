"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";
import { ROOM_TYPES, ROOM_STATUSES } from "@/lib/constants";

const roomSchema = z.object({
  room_number: z.string().min(1),
  room_type: z.enum(ROOM_TYPES),
  capacity: z.coerce.number().int().min(1).max(20),
  price_per_night: z.coerce.number().min(0),
  description: z.string().optional(),
  amenities: z.array(z.string()).default([]),
});

type Result = { ok: boolean; error?: string; id?: string };

function parseRoom(formData: FormData) {
  return roomSchema.safeParse({
    room_number: formData.get("room_number"),
    room_type: formData.get("room_type"),
    capacity: formData.get("capacity"),
    price_per_night: formData.get("price_per_night"),
    description: formData.get("description") ?? "",
    amenities: formData.getAll("amenities").map(String),
  });
}

export async function createRoom(formData: FormData): Promise<Result> {
  const profile = await requireRole(["admin", "owner"]);
  const parsed = parseRoom(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .insert(parsed.data as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorId: profile.id,
    action: "room.created",
    entity: "rooms",
    entityId: (data as { id: string }).id,
    metadata: { room_number: parsed.data.room_number },
  });
  revalidatePath("/admin/rooms");
  return { ok: true, id: (data as { id: string }).id };
}

export async function updateRoom(id: string, formData: FormData): Promise<Result> {
  const profile = await requireRole(["admin", "owner"]);
  const parsed = parseRoom(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("rooms")
    .update(parsed.data as never)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorId: profile.id,
    action: "room.updated",
    entity: "rooms",
    entityId: id,
  });
  revalidatePath("/admin/rooms");
  return { ok: true, id };
}

export async function setRoomStatus(id: string, status: string): Promise<Result> {
  const profile = await requireRole(["receptionist", "admin", "owner"]);
  if (!(ROOM_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Invalid status" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("rooms")
    .update({ status } as never)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorId: profile.id,
    action: "room.status_changed",
    entity: "rooms",
    entityId: id,
    metadata: { status },
  });
  revalidatePath("/admin/rooms");
  revalidatePath("/reception");
  return { ok: true };
}

export async function deleteRoom(id: string): Promise<Result> {
  const profile = await requireRole(["admin", "owner"]);
  const supabase = await createClient();

  // Don't delete rooms with active bookings — deactivate instead.
  const { data: active } = await supabase
    .from("bookings")
    .select("id")
    .eq("room_id", id)
    .in("status", ["Reserved", "Confirmed", "Checked-In"])
    .limit(1);

  if (active && active.length > 0) {
    const { error } = await supabase
      .from("rooms")
      .update({ is_active: false, status: "Out of Service" } as never)
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    await logAudit({ actorId: profile.id, action: "room.deactivated", entity: "rooms", entityId: id });
    revalidatePath("/admin/rooms");
    return { ok: true };
  }

  const { error } = await supabase.from("rooms").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ actorId: profile.id, action: "room.deleted", entity: "rooms", entityId: id });
  revalidatePath("/admin/rooms");
  return { ok: true };
}

export async function addRoomImage(
  roomId: string,
  formData: FormData
): Promise<Result> {
  await requireRole(["admin", "owner"]);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file selected" };
  }
  const supabase = await createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${roomId}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("room-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) return { ok: false, error: upErr.message };

  // First image becomes primary
  const { count } = await supabase
    .from("room_images")
    .select("id", { count: "exact", head: true })
    .eq("room_id", roomId);

  const { error } = await supabase.from("room_images").insert({
    room_id: roomId,
    storage_path: path,
    is_primary: (count ?? 0) === 0,
    sort_order: count ?? 0,
  } as never);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/rooms");
  return { ok: true };
}

export async function deleteRoomImage(
  imageId: string,
  storagePath: string
): Promise<Result> {
  await requireRole(["admin", "owner"]);
  const supabase = await createClient();
  if (!storagePath.startsWith("http")) {
    await supabase.storage.from("room-images").remove([storagePath]);
  }
  const { error } = await supabase.from("room_images").delete().eq("id", imageId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/rooms");
  return { ok: true };
}
