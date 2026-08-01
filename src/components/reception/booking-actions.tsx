"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn, LogOut, UserX, Wallet, ArrowLeftRight, Loader2, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { PAYMENT_METHODS } from "@/lib/constants";
import {
  checkInBooking,
  checkOutBooking,
  markNoShow,
  recordPayment,
  transferRoom,
  releaseHold,
} from "@/app/reception/actions";

const RELEASABLE = ["Pending", "Awaiting Payment", "Reserved"];

export interface ActionBooking {
  id: string;
  status: string;
  total_amount: number;
}

export function BookingActions({
  booking,
  rooms,
}: {
  booking: ActionBooking;
  rooms: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (res.ok) {
      toast.success(msg);
      router.refresh();
    } else toast.error(res.error ?? "Action failed");
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {(booking.status === "Reserved" || booking.status === "Confirmed") && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => run(() => checkInBooking(booking.id), "Checked in")}
          className="bg-primary text-primary-foreground"
        >
          <LogIn className="size-4" /> Check in
        </Button>
      )}
      {booking.status === "Checked-In" && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => run(() => checkOutBooking(booking.id), "Checked out")}
          className="bg-primary text-primary-foreground"
        >
          <LogOut className="size-4" /> Check out
        </Button>
      )}
      {(booking.status === "Reserved" || booking.status === "Confirmed") && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => run(() => markNoShow(booking.id), "Marked as no-show")}
        >
          <UserX className="size-4" /> No-show
        </Button>
      )}

      <PaymentDialog bookingId={booking.id} amount={booking.total_amount} onDone={() => router.refresh()} />

      {["Reserved", "Confirmed", "Checked-In"].includes(booking.status) && rooms.length > 0 && (
        <TransferDialog bookingId={booking.id} rooms={rooms} onDone={() => router.refresh()} />
      )}

      {RELEASABLE.includes(booking.status) && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => run(() => releaseHold(booking.id), "Hold released")}
          className="text-destructive"
        >
          <CircleX className="size-4" /> Release
        </Button>
      )}
    </div>
  );
}

function PaymentDialog({
  bookingId,
  amount,
  onDone,
}: {
  bookingId: string;
  amount: number;
  onDone: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [method, setMethod] = React.useState("cash");
  const [pending, setPending] = React.useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("bookingId", bookingId);
    fd.set("method", method);
    const res = await recordPayment(fd);
    setPending(false);
    if (res.ok) {
      toast.success("Payment recorded");
      setOpen(false);
      onDone();
    } else toast.error(res.error ?? "Failed");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Wallet className="size-4" /> Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m} className="capitalize">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (GHS)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min={0}
              defaultValue={amount}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="bg-gold text-gold-foreground hover:bg-gold/90">
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TransferDialog({
  bookingId,
  rooms,
  onDone,
}: {
  bookingId: string;
  rooms: { id: string; label: string }[];
  onDone: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [roomId, setRoomId] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function submit() {
    if (!roomId) return;
    setPending(true);
    const res = await transferRoom(bookingId, roomId);
    setPending(false);
    if (res.ok) {
      toast.success("Room transferred");
      setOpen(false);
      onDone();
    } else toast.error(res.error ?? "Failed");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <ArrowLeftRight className="size-4" /> Transfer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer / upgrade room</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Move to</Label>
          <Select value={roomId} onValueChange={setRoomId}>
            <SelectTrigger>
              <SelectValue placeholder="Select available room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            The total will be recalculated at the new room&apos;s nightly rate.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={pending || !roomId} className="bg-primary text-primary-foreground">
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
