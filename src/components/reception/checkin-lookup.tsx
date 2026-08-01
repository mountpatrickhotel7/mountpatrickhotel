"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Loader2, LogIn, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  lookupByReference,
  checkInBooking,
  type LookupBooking,
} from "@/app/reception/actions";

export function CheckinLookup() {
  const router = useRouter();
  const [ref, setRef] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [booking, setBooking] = React.useState<LookupBooking | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setBooking(null);
    const res = await lookupByReference(ref);
    setLoading(false);
    if (res.ok && res.booking) setBooking(res.booking);
    else toast.error(res.error ?? "Not found");
  }

  async function doCheckIn() {
    if (!booking) return;
    setBusy(true);
    const res = await checkInBooking(booking.id);
    setBusy(false);
    if (res.ok) {
      toast.success(`${booking.guest_name ?? "Guest"} checked in`);
      setBooking({ ...booking, status: "Checked-In" });
      router.refresh();
    } else toast.error(res.error ?? "Failed");
  }

  return (
    <div className="max-w-xl">
      <form onSubmit={search} className="flex gap-2">
        <div className="relative flex-1">
          <ScanLine className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="Scan QR or enter booking reference (e.g. MP-7K2P9Q)"
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        </Button>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">
        Paste a scanned QR payload or type the reference. A handheld scanner enters the
        code into this field automatically.
      </p>

      {booking && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold">{booking.guest_name ?? "Guest"}</h3>
            <StatusBadge status={booking.status} />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Reference" value={booking.reference} />
            <Row label="Room" value={booking.room} />
            <Row label="Phone" value={booking.guest_phone ?? "—"} />
            <Row label="Stay" value={`${formatDate(booking.check_in)} → ${formatDate(booking.check_out)}`} />
            <Row label="Guests" value={String(booking.guests_count)} />
            <Row label="Total" value={formatCurrency(booking.total_amount)} />
            <Row label="Payment" value={booking.paymentMode === "pay_now" ? "Paid online" : "Pay at hotel"} />
          </dl>

          {(booking.status === "Reserved" || booking.status === "Confirmed") ? (
            <Button
              onClick={doCheckIn}
              disabled={busy}
              className="mt-5 w-full bg-gold text-gold-foreground hover:bg-gold/90"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <><LogIn className="size-4" /> Complete check-in</>}
            </Button>
          ) : (
            <p className="mt-5 rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
              This booking is <strong>{booking.status}</strong> and can&apos;t be checked in.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-border/60 pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
