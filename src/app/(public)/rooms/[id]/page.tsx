import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, Users, BedDouble, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoomGallery } from "@/components/room-gallery";
import { BookingWidget } from "@/components/booking-widget";
import { getRoomById } from "@/lib/queries";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{
  checkIn?: string;
  checkOut?: string;
  guests?: string;
}>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const room = await getRoomById(id);
  return { title: room ? `${room.room_type} · Room ${room.room_number}` : "Room" };
}

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const room = await getRoomById(id);
  if (!room) notFound();

  const images = (room.room_images ?? [])
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
    .map((i) => i.storage_path);

  return (
    <div className="container-page py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/rooms">
          <ArrowLeft className="size-4" /> All rooms
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <RoomGallery paths={images} alt={`${room.room_type} room`} />

          <div className="mt-8">
            <Badge className="bg-gold/15 text-gold">{room.room_type}</Badge>
            <h1 className="mt-3 font-heading text-3xl font-semibold md:text-4xl">
              {room.room_type}{" "}
              <span className="text-muted-foreground">· Room {room.room_number}</span>
            </h1>
            <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="size-4 text-gold" /> Sleeps {room.capacity}
              </span>
              <span className="flex items-center gap-1.5">
                <BedDouble className="size-4 text-gold" /> {room.room_type} bedding
              </span>
            </div>

            <p className="mt-6 max-w-2xl leading-relaxed text-foreground/80">
              {room.description}
            </p>

            <h2 className="mt-10 font-heading text-xl font-semibold">Amenities</h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {room.amenities.map((a) => (
                <li key={a} className="flex items-center gap-2.5 text-sm">
                  <span className="grid size-6 place-items-center rounded-full bg-gold/15 text-gold">
                    <Check className="size-3.5" />
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <BookingWidget
            roomId={room.id}
            pricePerNight={room.price_per_night}
            capacity={room.capacity}
            defaultCheckIn={sp.checkIn}
            defaultCheckOut={sp.checkOut}
            defaultGuests={sp.guests ? Number(sp.guests) : undefined}
          />
        </aside>
      </div>
    </div>
  );
}
