import Link from "next/link";
import { CalendarX2, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { CancelBookingButton } from "@/components/cancel-booking-button";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata = { title: "My Bookings" };

const CANCELLABLE = ["Pending", "Awaiting Payment", "Reserved", "Confirmed"];

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, rooms(room_number, room_type)")
    .order("created_at", { ascending: false });

  type B = {
    id: string;
    reference: string;
    status: string;
    check_in: string;
    check_out: string;
    total_amount: number;
    rooms?: { room_number: string; room_type: string } | null;
  };
  const bookings = (data ?? []) as unknown as B[];

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
        <CalendarX2 className="size-10 text-muted-foreground" />
        <h3 className="mt-4 font-heading text-xl font-semibold">No bookings yet</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          When you reserve a room, it will appear here with your QR code and receipt.
        </p>
        <Button asChild className="mt-6 bg-gold text-gold-foreground hover:bg-gold/90">
          <Link href="/rooms">Browse rooms</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((b) => (
        <div
          key={b.id}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft md:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-heading text-lg font-semibold">
                  {b.rooms ? `${b.rooms.room_type} · Room ${b.rooms.room_number}` : "Room"}
                </h3>
                <StatusBadge status={b.status} />
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {b.reference}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatDate(b.check_in)} → {formatDate(b.check_out)} ·{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(b.total_amount)}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/book/confirmation/${b.reference}`}>
                  <QrCode className="size-4" /> QR
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href={`/api/bookings/${b.reference}/receipt`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download className="size-4" /> Receipt
                </a>
              </Button>
              {CANCELLABLE.includes(b.status) && (
                <CancelBookingButton bookingId={b.id} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
