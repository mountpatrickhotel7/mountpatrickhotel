import { SearchX } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { RoomCard } from "@/components/room-card";
import { PageHeader } from "@/components/page-header";
import { getRooms, searchAvailableRooms } from "@/lib/queries";
import { ROOM_TYPES, type RoomType } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Rooms & Suites" };

type SearchParams = Promise<{
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  type?: string;
}>;

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const hasSearch = Boolean(sp.checkIn && sp.checkOut);
  const roomType = (ROOM_TYPES as readonly string[]).includes(sp.type ?? "")
    ? (sp.type as RoomType)
    : null;

  const rooms = hasSearch
    ? await searchAvailableRooms({
        checkIn: sp.checkIn!,
        checkOut: sp.checkOut!,
        guests: sp.guests ? Number(sp.guests) : 1,
        roomType,
      })
    : await getRooms();

  const query = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v) as [string, string][]
  ).toString();

  return (
    <>
      <PageHeader
        eyebrow="Stay With Us"
        title="Rooms & Suites"
        description="Find a space composed for stillness. Search by your dates to see real-time availability."
      />

      <section className="container-page -mt-8 pb-20">
        <SearchBar
          className="mb-10"
          defaultValues={{
            checkIn: sp.checkIn,
            checkOut: sp.checkOut,
            guests: sp.guests ? Number(sp.guests) : undefined,
            type: sp.type,
          }}
        />

        {hasSearch && (
          <p className="mb-6 text-sm text-muted-foreground">
            {rooms.length} {rooms.length === 1 ? "room" : "rooms"} available ·{" "}
            {formatDate(sp.checkIn!)} → {formatDate(sp.checkOut!)}
            {roomType ? ` · ${roomType}` : ""}
          </p>
        )}

        {rooms.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
            <SearchX className="size-10 text-muted-foreground" />
            <h3 className="mt-4 font-heading text-xl font-semibold">
              No rooms match your search
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Try adjusting your dates, guest count, or room type to find your
              perfect stay.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} query={query} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
