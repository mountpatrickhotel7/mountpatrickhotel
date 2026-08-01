"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROOM_TYPES, COMMON_AMENITIES } from "@/lib/constants";
import { resolveImageUrl } from "@/lib/images";
import {
  createRoom,
  updateRoom,
  addRoomImage,
  deleteRoomImage,
} from "@/app/admin/rooms/actions";
import type { Room, RoomImage } from "@/lib/supabase/types";

export function RoomForm({
  room,
  images,
  onDone,
}: {
  room?: Room;
  images?: RoomImage[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [type, setType] = React.useState<string>(room?.room_type ?? "Standard");
  const [amenities, setAmenities] = React.useState<Set<string>>(
    new Set(room?.amenities ?? [])
  );

  function toggle(a: string) {
    setAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("room_type", type);
    fd.delete("amenities");
    amenities.forEach((a) => fd.append("amenities", a));
    const res = room ? await updateRoom(room.id, fd) : await createRoom(fd);
    setPending(false);
    if (res.ok) {
      toast.success(room ? "Room updated" : "Room created");
      router.refresh();
      onDone();
    } else {
      toast.error(res.error ?? "Something went wrong");
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!room || !e.target.files?.[0]) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("file", e.target.files[0]);
    const res = await addRoomImage(room.id, fd);
    setUploading(false);
    e.target.value = "";
    if (res.ok) {
      toast.success("Image uploaded");
      router.refresh();
    } else {
      toast.error(res.error ?? "Upload failed");
    }
  }

  async function removeImage(img: RoomImage) {
    const res = await deleteRoomImage(img.id, img.storage_path);
    if (res.ok) {
      toast.success("Image removed");
      router.refresh();
    } else {
      toast.error(res.error ?? "Could not remove");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="room_number">Room number</Label>
          <Input
            id="room_number"
            name="room_number"
            defaultValue={room?.room_number}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Room type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROOM_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={room?.capacity ?? 2}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price_per_night">Price / night (GHS)</Label>
          <Input
            id="price_per_night"
            name="price_per_night"
            type="number"
            min={0}
            step="0.01"
            defaultValue={room?.price_per_night}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={room?.description ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label>Amenities</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COMMON_AMENITIES.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <Checkbox checked={amenities.has(a)} onCheckedChange={() => toggle(a)} />
              {a}
            </label>
          ))}
        </div>
      </div>

      {room && (
        <div className="space-y-2">
          <Label>Images</Label>
          <div className="flex flex-wrap gap-3">
            {(images ?? []).map((img) => (
              <div
                key={img.id}
                className="relative size-20 overflow-hidden rounded-lg border border-border"
              >
                <Image
                  src={resolveImageUrl(img.storage_path)}
                  alt="Room"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
                {img.is_primary && (
                  <span className="absolute left-1 top-1 rounded bg-gold p-0.5 text-gold-foreground">
                    <Star className="size-3 fill-current" />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img)}
                  className="absolute right-1 top-1 rounded bg-destructive/90 p-0.5 text-white"
                  aria-label="Remove image"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
            <label className="grid size-20 cursor-pointer place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-gold hover:text-gold">
              {uploading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Upload className="size-5" />
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </label>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="bg-gold text-gold-foreground hover:bg-gold/90"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : room ? "Save changes" : "Create room"}
        </Button>
      </div>
      {!room && (
        <p className="text-xs text-muted-foreground">
          You can add images after creating the room.
        </p>
      )}
    </form>
  );
}
