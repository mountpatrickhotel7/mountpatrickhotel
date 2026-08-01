"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { CalendarIcon, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";

export function BookingWidget({
  roomId,
  pricePerNight,
  capacity,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests,
}: {
  roomId: string;
  pricePerNight: number;
  capacity: number;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [checkIn, setCheckIn] = React.useState<Date>(
    defaultCheckIn ? new Date(defaultCheckIn) : new Date()
  );
  const [checkOut, setCheckOut] = React.useState<Date>(
    defaultCheckOut ? new Date(defaultCheckOut) : addDays(new Date(), 1)
  );
  const [guests, setGuests] = React.useState(
    Math.min(defaultGuests ?? 2, capacity)
  );

  const nights = Math.max(1, differenceInCalendarDays(checkOut, checkIn));
  const subtotal = nights * pricePerNight;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function reserve() {
    setLoading(true);
    const params = new URLSearchParams({
      room: roomId,
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
      guests: String(guests),
    });
    router.push(`/book?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-baseline justify-between">
        <p className="font-heading text-2xl font-bold text-gold">
          {formatCurrency(pricePerNight)}
        </p>
        <span className="text-sm text-muted-foreground">per night</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <DatePopover
          label="Check-in"
          value={checkIn}
          onChange={(d) => {
            setCheckIn(d);
            if (checkOut <= d) setCheckOut(addDays(d, 1));
          }}
          disabled={(d) => d < today}
        />
        <DatePopover
          label="Check-out"
          value={checkOut}
          onChange={setCheckOut}
          disabled={(d) => d <= checkIn}
        />
      </div>

      <div className="mt-2 flex items-center justify-between rounded-md border border-border px-3 py-2.5">
        <span className="flex items-center gap-2 text-sm">
          <Users className="size-4 text-gold" /> Guests
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="grid size-6 place-items-center rounded-full border border-border hover:bg-accent"
          >
            −
          </button>
          <span className="w-4 text-center text-sm font-medium">{guests}</span>
          <button
            type="button"
            onClick={() => setGuests((g) => Math.min(capacity, g + 1))}
            className="grid size-6 place-items-center rounded-full border border-border hover:bg-accent"
          >
            +
          </button>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>
            {formatCurrency(pricePerNight)} × {nights}{" "}
            {nights === 1 ? "night" : "nights"}
          </span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between font-heading text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </div>

      <Button
        onClick={reserve}
        disabled={loading}
        size="lg"
        className="mt-5 w-full bg-gold text-gold-foreground hover:bg-gold/90"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Reserve"}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        You won&apos;t be charged until you confirm payment.
      </p>
    </div>
  );
}

function DatePopover({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  disabled?: (d: Date) => boolean;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex flex-col items-start gap-0.5 rounded-md border border-border px-3 py-2 text-left hover:bg-accent"
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <CalendarIcon className="size-3.5 text-gold" />
            {format(value, "d MMM")}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            if (d) onChange(d);
            setOpen(false);
          }}
          disabled={disabled}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
