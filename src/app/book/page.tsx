import { redirect } from "next/navigation";
import Image from "next/image";
import { CalendarDays, Users, Moon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookForm } from "@/components/book-form";
import { getProfile } from "@/lib/auth";
import { getRoomById, primaryImage } from "@/lib/queries";
import { resolveImageUrl } from "@/lib/images";
import { formatCurrency, formatDate, nightsBetween } from "@/lib/format";

export const metadata = { title: "Complete your booking" };

type SearchParams = Promise<{
  room?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
}>;

export default async function BookPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v) as [string, string][]
  ).toString();

  const profile = await getProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(`/book?${qs}`)}`);

  if (!sp.room || !sp.checkIn || !sp.checkOut) redirect("/rooms");
  const room = await getRoomById(sp.room);
  if (!room) redirect("/rooms");

  const guests = sp.guests ? Number(sp.guests) : 1;
  const nights = nightsBetween(sp.checkIn, sp.checkOut);
  const total = nights * room.price_per_night;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-sidebar">
        <div className="container-page py-10">
          <h1 className="font-heading text-3xl font-semibold">Complete your booking</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;re one step away from your stay at Mount Patrick.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Form */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
              <BookForm
                roomId={room.id}
                checkIn={sp.checkIn}
                checkOut={sp.checkOut}
                guests={guests}
                defaultName={profile.full_name ?? ""}
                defaultPhone={profile.phone ?? ""}
                defaultEmail={profile.email ?? ""}
              />
            </div>

            {/* Summary */}
            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                <Image
                  src={resolveImageUrl(primaryImage(room))}
                  alt={room.room_type}
                  fill
                  sizes="380px"
                  className="object-cover"
                />
              </div>
              <h2 className="mt-4 font-heading text-xl font-semibold">
                {room.room_type}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  · Room {room.room_number}
                </span>
              </h2>

              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-4 text-gold" />
                  {formatDate(sp.checkIn)} → {formatDate(sp.checkOut)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Moon className="size-4 text-gold" /> {nights}{" "}
                  {nights === 1 ? "night" : "nights"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="size-4 text-gold" /> {guests}{" "}
                  {guests === 1 ? "guest" : "guests"}
                </div>
              </dl>

              <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    {formatCurrency(room.price_per_night)} × {nights}
                  </span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between font-heading text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-gold">{formatCurrency(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
