"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoomForm } from "@/components/admin/room-form";
import { resolveImageUrl } from "@/lib/images";
import { formatCurrency } from "@/lib/format";
import { ROOM_STATUSES } from "@/lib/constants";
import { setRoomStatus, deleteRoom } from "@/app/admin/rooms/actions";
import type { RoomWithImages } from "@/lib/queries";

export function RoomsManager({ rooms }: { rooms: RoomWithImages[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = React.useState(false);
  const [editRoom, setEditRoom] = React.useState<RoomWithImages | null>(null);

  async function changeStatus(id: string, status: string) {
    const res = await setRoomStatus(id, status);
    if (res.ok) {
      toast.success("Status updated");
      router.refresh();
    } else toast.error(res.error ?? "Failed");
  }

  async function onDelete(id: string, number: string) {
    if (!confirm(`Delete room ${number}? Rooms with active bookings are deactivated instead.`))
      return;
    const res = await deleteRoom(id);
    if (res.ok) {
      toast.success("Room removed");
      router.refresh();
    } else toast.error(res.error ?? "Failed");
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="size-4" /> Add room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading">Add a room</DialogTitle>
            </DialogHeader>
            <RoomForm onDone={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Cap.</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-44">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => {
              const primary =
                room.room_images?.find((i) => i.is_primary)?.storage_path ??
                room.room_images?.[0]?.storage_path;
              return (
                <TableRow key={room.id}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={resolveImageUrl(primary)}
                        alt={room.room_number}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{room.room_number}</TableCell>
                  <TableCell>{room.room_type}</TableCell>
                  <TableCell>{room.capacity}</TableCell>
                  <TableCell>{formatCurrency(room.price_per_night)}</TableCell>
                  <TableCell>
                    <Select
                      value={room.status}
                      onValueChange={(v) => changeStatus(room.id, v)}
                    >
                      <SelectTrigger className="h-8 w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditRoom(room)}
                      aria-label="Edit"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(room.id, room.room_number)}
                      aria-label="Delete"
                      className="text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editRoom} onOpenChange={(o) => !o && setEditRoom(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Edit room {editRoom?.room_number}
            </DialogTitle>
          </DialogHeader>
          {editRoom && (
            <RoomForm
              room={editRoom}
              images={editRoom.room_images}
              onDone={() => setEditRoom(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
