"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";
import { CalendarIcon, Search, Users, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ROOM_TYPES } from "@/lib/constants";

function DateField({
  label,
  date,
  onSelect,
  disabled,
  className,
}: {
  label: string;
  date: Date | undefined;
  onSelect: (d: Date | undefined) => void;
  disabled?: (d: Date) => boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full flex-col items-start justify-center gap-0.5 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent",
            className
          )}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="flex items-center gap-2 text-sm font-medium">
            <CalendarIcon className="size-4 text-gold" />
            {date ? format(date, "EEE, d MMM") : "Select date"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onSelect(d);
            setOpen(false);
          }}
          disabled={disabled}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function SearchBar({
  className,
  defaultValues,
}: {
  className?: string;
  defaultValues?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    type?: string;
  };
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = React.useState<Date | undefined>(
    defaultValues?.checkIn ? new Date(defaultValues.checkIn) : new Date()
  );
  const [checkOut, setCheckOut] = React.useState<Date | undefined>(
    defaultValues?.checkOut
      ? new Date(defaultValues.checkOut)
      : addDays(new Date(), 1)
  );
  const [guests, setGuests] = React.useState(defaultValues?.guests ?? 2);
  const [type, setType] = React.useState(defaultValues?.type ?? "any");

  function submit() {
    if (!checkIn || !checkOut) return;
    const params = new URLSearchParams({
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
      guests: String(guests),
    });
    if (type && type !== "any") params.set("type", type);
    router.push(`/rooms?${params.toString()}`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-1 rounded-2xl border border-border bg-card p-2 shadow-float md:grid-cols-[1.2fr_1.2fr_1fr_1.3fr_auto] md:items-stretch md:gap-0",
        className
      )}
    >
      <DateField
        label="Check-in"
        date={checkIn}
        onSelect={(d) => {
          setCheckIn(d);
          if (d && checkOut && checkOut <= d) setCheckOut(addDays(d, 1));
        }}
        disabled={(d) => d < today}
      />
      <DateField
        label="Check-out"
        date={checkOut}
        onSelect={setCheckOut}
        disabled={(d) => d <= (checkIn ?? today)}
        className="md:border-l md:border-border"
      />

      <div className="flex items-center gap-2 rounded-md px-3 py-2 md:border-l md:border-border">
        <Users className="size-4 text-gold" />
        <div className="flex flex-1 flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Guests
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="grid size-6 place-items-center rounded-full border border-border text-sm hover:bg-accent"
              aria-label="Fewer guests"
            >
              −
            </button>
            <span className="w-4 text-center text-sm font-medium">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(10, g + 1))}
              className="grid size-6 place-items-center rounded-full border border-border text-sm hover:bg-accent"
              aria-label="More guests"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="hidden flex-col justify-center px-3 py-2 md:flex md:border-l md:border-border">
        <span className="px-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Room type
        </span>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-8 border-0 px-0 shadow-none focus-visible:ring-0">
            <span className="flex items-center gap-2 text-sm font-medium">
              <BedDouble className="size-4 text-gold" />
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any type</SelectItem>
            {ROOM_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={submit}
        size="lg"
        className="mt-1 h-12 w-full bg-gold text-gold-foreground hover:bg-gold/90 md:mt-0 md:ml-2 md:h-auto md:w-auto md:self-stretch md:px-8"
      >
        <Search className="size-4" />
        <span>Search</span>
      </Button>
    </div>
  );
}
