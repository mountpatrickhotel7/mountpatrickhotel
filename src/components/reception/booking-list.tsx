import { CalendarDays, User, BedDouble } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { BookingActions } from "@/components/reception/booking-actions";
import { formatCurrency, formatDate } from "@/lib/format";

export interface ListBooking {
  id: string;
  reference: string;
  status: string;
  guest_name: string | null;
  check_in: string;
  check_out: string;
  total_amount: number;
  guests_count: number;
  source: string;
  hold_expires_at: string | null;
  rooms?: { room_number: string; room_type: string } | null;
}

const HELD = ["Pending", "Awaiting Payment", "Reserved"];

function holdExpired(b: ListBooking): boolean {
  return (
    HELD.includes(b.status) &&
    !!b.hold_expires_at &&
    new Date(b.hold_expires_at) < new Date()
  );
}

export function BookingList({
  bookings,
  rooms,
  emptyLabel = "Nothing here.",
}: {
  bookings: ListBooking[];
  rooms: { id: string; label: string }[];
  emptyLabel?: string;
}) {
  if (bookings.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div
          key={b.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-soft"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{b.guest_name ?? "Guest"}</span>
              <StatusBadge status={b.status} />
              {b.source === "walk_in" && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                  Walk-in
                </span>
              )}
              {holdExpired(b) && (
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-300">
                  Hold expired
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-mono">{b.reference}</span>
              <span className="flex items-center gap-1">
                <BedDouble className="size-3.5" />
                {b.rooms ? `${b.rooms.room_type} · ${b.rooms.room_number}` : "—"}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {formatDate(b.check_in)} → {formatDate(b.check_out)}
              </span>
              <span className="flex items-center gap-1">
                <User className="size-3.5" />
                {b.guests_count}
              </span>
              <span className="font-medium text-foreground">
                {formatCurrency(b.total_amount)}
              </span>
            </div>
          </div>
          <BookingActions
            booking={{ id: b.id, status: b.status, total_amount: b.total_amount }}
            rooms={rooms}
          />
        </div>
      ))}
    </div>
  );
}
