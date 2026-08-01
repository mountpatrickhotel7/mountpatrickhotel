import { addDays, format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export interface CalendarRoom {
  id: string;
  room_number: string;
  room_type: string;
  status: string;
}
export interface CalendarBooking {
  room_id: string;
  check_in: string;
  check_out: string;
  status: string;
  guest_name: string | null;
  reference: string;
}

const CELL: Record<string, string> = {
  Reserved: "bg-amber-400/70 text-amber-950",
  Confirmed: "bg-emerald-400/70 text-emerald-950",
  "Checked-In": "bg-blue-400/70 text-blue-950",
};

function iso(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function RoomCalendar({
  rooms,
  bookings,
  start,
  days,
}: {
  rooms: CalendarRoom[];
  bookings: CalendarBooking[];
  start: string;
  days: number;
}) {
  const startDate = parseISO(start);
  const cols = Array.from({ length: days }, (_, i) => addDays(startDate, i));
  const todayIso = iso(new Date());

  // room_id -> (dateIso -> booking)
  const grid = new Map<string, Map<string, CalendarBooking>>();
  for (const b of bookings) {
    const map = grid.get(b.room_id) ?? new Map<string, CalendarBooking>();
    for (const d of cols) {
      const di = iso(d);
      if (b.check_in <= di && di < b.check_out) map.set(di, b);
    }
    grid.set(b.room_id, map);
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
      <div
        className="grid min-w-max text-xs"
        style={{ gridTemplateColumns: `190px repeat(${days}, minmax(46px, 1fr))` }}
      >
        {/* Header */}
        <div className="sticky left-0 z-10 border-b border-r border-border bg-card px-3 py-2 font-semibold">
          Room
        </div>
        {cols.map((d) => {
          const di = iso(d);
          return (
            <div
              key={di}
              className={cn(
                "border-b border-border px-1 py-2 text-center",
                di === todayIso && "bg-gold/10 font-semibold"
              )}
            >
              <div className="text-muted-foreground">{format(d, "EEE")}</div>
              <div>{format(d, "d MMM")}</div>
            </div>
          );
        })}

        {/* Rows */}
        {rooms.map((room) => {
          const map = grid.get(room.id);
          return (
            <RoomRow key={room.id} room={room} cols={cols} map={map} todayIso={todayIso} />
          );
        })}
      </div>
    </div>
  );
}

function RoomRow({
  room,
  cols,
  map,
  todayIso,
}: {
  room: CalendarRoom;
  cols: Date[];
  map?: Map<string, CalendarBooking>;
  todayIso: string;
}) {
  const blocked = ["Maintenance", "Out of Service", "Cleaning"].includes(room.status);
  return (
    <>
      <div className="sticky left-0 z-10 flex items-center justify-between gap-2 border-b border-r border-border bg-card px-3 py-2">
        <span className="font-medium">
          {room.room_number}
          <span className="ml-1 font-normal text-muted-foreground">{room.room_type}</span>
        </span>
        {blocked && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {room.status}
          </span>
        )}
      </div>
      {cols.map((d) => {
        const di = iso(d);
        const b = map?.get(di);
        const showName = b && (b.check_in === di || di === iso(cols[0]));
        return (
          <div
            key={di}
            title={
              b
                ? `${b.guest_name ?? "Guest"} · ${b.reference} (${b.status})`
                : `${room.room_number} available ${di}`
            }
            className={cn(
              "min-h-9 border-b border-l border-border/60 px-1 py-1.5 text-center",
              di === todayIso && !b && "bg-gold/5",
              b ? CELL[b.status] ?? "bg-muted" : ""
            )}
          >
            {showName && (
              <span className="line-clamp-1 text-[10px] font-medium">
                {(b!.guest_name ?? "Guest").split(" ")[0]}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
}
