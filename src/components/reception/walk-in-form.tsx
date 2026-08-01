"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ID_TYPES, PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { createWalkIn } from "@/app/reception/actions";

interface RoomOption {
  id: string;
  label: string;
  price: number;
  capacity: number;
}

export function WalkInForm({
  rooms,
  today,
  tomorrow,
}: {
  rooms: RoomOption[];
  today: string;
  tomorrow: string;
}) {
  const router = useRouter();

  const [roomId, setRoomId] = React.useState("");
  const [idType, setIdType] = React.useState<string>(ID_TYPES[0]);
  const [method, setMethod] = React.useState("cash");
  const [pending, setPending] = React.useState(false);
  const [doneRef, setDoneRef] = React.useState<string | null>(null);

  const selectedRoom = rooms.find((r) => r.id === roomId);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!roomId) {
      toast.error("Select a room");
      return;
    }
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("roomId", roomId);
    fd.set("idType", idType);
    fd.set("method", method);
    const res = await createWalkIn(fd);
    setPending(false);
    if (res.ok && res.reference) {
      toast.success("Walk-in checked in");
      setDoneRef(res.reference);
      router.refresh();
    } else toast.error(res.error ?? "Failed");
  }

  if (doneRef) {
    return (
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
        <h3 className="mt-3 font-heading text-xl font-semibold">Guest checked in</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Reference <span className="font-mono font-medium">{doneRef}</span>
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button asChild variant="outline">
            <a href={`/api/bookings/${doneRef}/receipt`} target="_blank" rel="noreferrer">
              <Download className="size-4" /> Receipt
            </a>
          </Button>
          <Button onClick={() => setDoneRef(null)} className="bg-gold text-gold-foreground hover:bg-gold/90">
            New walk-in
          </Button>
        </div>
        <Link href="/reception" className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">
          Back to front desk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="guestName">Guest name</Label>
          <Input id="guestName" name="guestName" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required />
        </div>
        <div className="space-y-1.5">
          <Label>ID type</Label>
          <Select value={idType} onValueChange={setIdType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ID_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="idNumber">ID number</Label>
          <Input id="idNumber" name="idNumber" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Room</Label>
          <Select value={roomId} onValueChange={setRoomId}>
            <SelectTrigger><SelectValue placeholder="Select an available room" /></SelectTrigger>
            <SelectContent>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label} — {formatCurrency(r.price)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="guests">Guests</Label>
          <Input
            id="guests"
            name="guests"
            type="number"
            min={1}
            max={selectedRoom?.capacity ?? 10}
            defaultValue={1}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="checkIn">Check-in</Label>
          <Input id="checkIn" name="checkIn" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="checkOut">Check-out</Label>
          <Input id="checkOut" name="checkOut" type="date" defaultValue={tomorrow} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Payment method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="sm:w-60"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={pending} size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Register & check in"}
      </Button>
    </form>
  );
}
