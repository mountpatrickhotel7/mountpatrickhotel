import Link from "next/link";
import Image from "next/image";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { resolveImageUrl } from "@/lib/images";
import { primaryImage, type RoomWithImages } from "@/lib/queries";

export function RoomCard({
  room,
  query,
}: {
  room: RoomWithImages;
  query?: string;
}) {
  const href = `/rooms/${room.id}${query ? `?${query}` : ""}`;
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-float">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={resolveImageUrl(primaryImage(room))}
          alt={`${room.room_type} room ${room.room_number}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur">
          {room.room_type}
        </Badge>
      </Link>
      <div className="space-y-3 p-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-xl font-semibold">
            {room.room_type}
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              · Room {room.room_number}
            </span>
          </h3>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {room.description}
        </p>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-4" /> Sleeps {room.capacity}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="font-heading">
            <span className="text-xl font-bold text-gold">
              {formatCurrency(room.price_per_night)}
            </span>
            <span className="text-sm font-normal text-muted-foreground"> / night</span>
          </p>
          <Button asChild size="sm" variant="ghost" className="group/btn">
            <Link href={href}>
              Details
              <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
