import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ConciergeBell,
  Sparkles,
  ShieldCheck,
  Wifi,
  Star,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { RoomCard } from "@/components/room-card";
import { HOTEL } from "@/lib/constants";
import { getRooms } from "@/lib/queries";
import { cn } from "@/lib/utils";

const PROMISES = [
  {
    icon: ConciergeBell,
    title: "Private Concierge",
    body: "A dedicated host anticipating every need, from arrival to farewell.",
  },
  {
    icon: Sparkles,
    title: "Curated Comfort",
    body: "Hand-selected linens, lighting, and finishes in every quiet room.",
  },
  {
    icon: ShieldCheck,
    title: "Effortless Booking",
    body: "Secure reservations, instant confirmation, and flexible payment.",
  },
  {
    icon: Wifi,
    title: "Connected Calm",
    body: "Fast Wi-Fi and thoughtful workspaces, should the world call.",
  },
];

const GALLERY = [
  { src: "/images/gallery/pool.jpg", label: "Swimming Pool", span: true },
  { src: "/images/gallery/lounge.jpg", label: "Rooftop Lounge" },
  { src: "/images/gallery/reception.jpg", label: "Reception" },
  { src: "/images/gallery/bar.jpg", label: "Bar & Games" },
  { src: "/images/gallery/terrace.jpg", label: "Garden Terrace" },
  { src: "/images/gallery/courtyard.jpg", label: "Courtyard" },
];

export default async function HomePage() {
  const rooms = await getRooms();
  const featured = rooms.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero-facade.jpg"
            alt="Mount Patrick Hotel building"
            fill
            priority
            className="object-cover object-[center_38%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-background" />
        </div>

        <div className="container-page flex min-h-[78vh] flex-col justify-center pb-28 pt-24 text-white">
          <span className="mb-4 inline-flex items-center gap-2 self-start rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur">
            <Star className="size-3.5 fill-gold text-gold" /> {HOTEL.tagline}
          </span>
          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-[1.1] text-balance md:text-6xl">
            A Sanctuary of Quiet Elegance
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Discover refined comfort in the heart of Kumasi. Where considered design
            and warm hospitality meet for a stay you will not forget.
          </p>
        </div>

        {/* Floating search bar */}
        <div className="container-page relative -mt-16 pb-4">
          <SearchBar />
        </div>
      </section>

      {/* Featured rooms */}
      <section className="container-page py-20 md:py-28">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Curated Living Spaces
          </span>
          <h2 className="mt-3 font-heading text-3xl font-semibold md:text-4xl">
            Rooms &amp; Suites
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Each space is composed for stillness — generous light, soft textures, and
            views over the Garden City beyond.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/rooms">
              View all rooms <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Promise / amenities */}
      <section className="bg-sidebar py-20 md:py-28">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-float">
            <Image
              src="/images/philosophy.jpg"
              alt="Private balcony overlooking the grounds"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Our Philosophy
            </span>
            <h2 className="mt-3 font-heading text-3xl font-semibold md:text-4xl">
              Defined by What Isn&apos;t There
            </h2>
            <p className="mt-4 text-muted-foreground">
              At Mount Patrick, luxury is not measured by excess, but by the absence
              of noise and the presence of peace. Every detail is a deliberate act of
              calm.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {PROMISES.map((p) => (
                <div key={p.title} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                    <p.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-heading font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container-page py-20 md:py-28">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Beyond the Room
          </span>
          <h2 className="mt-3 font-heading text-3xl font-semibold md:text-4xl">
            Explore Mount Patrick
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            A swimming pool, rooftop lounge, and warmly finished interiors — the
            spaces that make a stay feel like a retreat.
          </p>
        </div>

        <div className="grid auto-rows-[200px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map((g) => (
            <div
              key={g.label}
              className={cn(
                "group relative overflow-hidden rounded-2xl shadow-soft",
                g.span && "sm:col-span-2 sm:row-span-2"
              )}
            >
              <Image
                src={g.src}
                alt={g.label}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <span className="absolute bottom-4 left-4 font-heading text-lg font-semibold text-white drop-shadow">
                {g.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Location + CTA */}
      <section className="bg-primary py-20 text-primary-foreground md:py-24">
        <div className="container-page flex flex-col items-center text-center">
          <MapPin className="size-7 text-gold" />
          <h2 className="mt-4 font-heading text-3xl font-semibold md:text-4xl">
            Find Your Stillness
          </h2>
          <p className="mt-3 max-w-lg text-primary-foreground/75">
            {HOTEL.address}. Minutes from Kumasi City Mall and the lively heart of
            the Garden City.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
              <Link href="/rooms">Reserve your room</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/contact">Plan your visit</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
