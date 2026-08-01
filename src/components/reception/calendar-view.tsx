import Link from "next/link";
import { addDays, format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardTitle } from "@/components/dashboard/stat-card";
import {
  RoomCalendar,
  type CalendarRoom,
  type CalendarBooking,
} from "@/components/reception/room-calendar";
import { createClient } from "@/lib/supabase/server";
import { toISODate } from "@/lib/format";
import { cn } from "@/lib/utils";

const VIEWS = [
  { days: 7, label: "Week" },
  { days: 14, label: "2 Weeks" },
  { days: 30, label: "Month" },
];

const LEGEND = [
  ["Reserved", "bg-amber-400/70"],
  ["Confirmed", "bg-emerald-400/70"],
  ["Checked-In", "bg-blue-400/70"],
];

/**
 * Shared occupancy calendar. `basePath` keeps nav/view links inside the current
 * dashboard area (e.g. /reception/calendar vs /admin/calendar).
 */
export async function CalendarView({
  basePath,
  startParam,
  daysParam,
}: {
  basePath: string;
  startParam?: string;
  daysParam?: string;
}) {
  const today = toISODate(new Date());
  const start =
    startParam && /^\d{4}-\d{2}-\d{2}$/.test(startParam) ? startParam : today;
  const days = [7, 14, 30].includes(Number(daysParam)) ? Number(daysParam) : 14;

  const startDate = parseISO(start);
  const rangeEnd = toISODate(addDays(startDate, days));
  const prev = toISODate(addDays(startDate, -days));
  const next = toISODate(addDays(startDate, days));

  const supabase = await createClient();
  const [{ data: roomsData }, { data: bookingsData }] = await Promise.all([
    supabase
      .from("rooms")
      .select("id, room_number, room_type, status")
      .eq("is_active", true)
      .order("room_number"),
    supabase
      .from("bookings")
      .select("room_id, check_in, check_out, status, guest_name, reference")
      .in("status", ["Reserved", "Confirmed", "Checked-In"])
      .lt("check_in", rangeEnd)
      .gt("check_out", start),
  ]);

  const rooms = (roomsData ?? []) as unknown as CalendarRoom[];
  const bookings = (bookingsData ?? []) as unknown as CalendarBooking[];

  const viewHref = (d: number) => `${basePath}?start=${start}&days=${d}`;
  const navHref = (s: string) => `${basePath}?start=${s}&days=${days}`;

  return (
    <>
      <DashboardTitle
        title="Room Calendar"
        description="Occupancy at a glance. Hover a cell for booking details."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon">
            <Link href={navHref(prev)} aria-label="Previous">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={navHref(today)}>Today</Link>
          </Button>
          <Button asChild variant="outline" size="icon">
            <Link href={navHref(next)} aria-label="Next">
              <ChevronRight className="size-4" />
            </Link>
          </Button>
          <span className="ml-1 text-sm text-muted-foreground">
            {format(startDate, "d MMM")} – {format(addDays(startDate, days - 1), "d MMM yyyy")}
          </span>
        </div>

        <div className="flex gap-1.5">
          {VIEWS.map((v) => (
            <Button
              key={v.days}
              asChild
              size="sm"
              variant={v.days === days ? "default" : "outline"}
            >
              <Link href={viewHref(v.days)}>{v.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      <RoomCalendar rooms={rooms} bookings={bookings} start={start} days={days} />

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {LEGEND.map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={cn("size-3 rounded", color)} /> {label}
          </span>
        ))}
      </div>
    </>
  );
}
