import Image from "next/image";
import { Leaf, HandHeart, Gem, Mountain } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { HOTEL } from "@/lib/constants";

export const metadata = { title: "About" };

const VALUES = [
  { icon: Gem, title: "Refined Simplicity", body: "Every detail is intentional — nothing more, nothing less than what brings ease." },
  { icon: HandHeart, title: "Warm Hospitality", body: "Genuine Ghanaian warmth, anticipating your needs with quiet attentiveness." },
  { icon: Leaf, title: "Rooted in the City", body: "Set in the lively heart of Kumasi, a calm retreat from the energy just outside." },
  { icon: Mountain, title: "A Sense of Place", body: "A retreat that belongs to its city, honouring the Ashanti heritage it calls home." },
];

const STATS = [
  { value: "48", label: "Curated Rooms" },
  { value: "12", label: "Years of Service" },
  { value: "4.9", label: "Guest Rating" },
  { value: "24/7", label: "Concierge" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="About Mount Patrick"
        description="A sanctuary born from a simple belief — that true luxury is found in calm, comfort, and care."
      />

      <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-float">
          <Image
            src="/images/gallery/exterior.jpg"
            alt="Mount Patrick Hotel exterior"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-heading text-3xl font-semibold">
            Where Kumasi Meets Hospitality
          </h2>
          <p className="mt-4 text-muted-foreground">
            Nestled in Atonsu, in the heart of Kumasi, Mount Patrick Hotel was founded on a
            singular vision: to create a place where guests could step away from the
            noise of the city and into a space of considered calm.
          </p>
          <p className="mt-4 text-muted-foreground">
            From our hand-finished rooms to our thoughtfully sourced cuisine, every
            element is composed to make your stay effortless. We measure our success not
            in grandeur, but in the quiet moments of peace our guests carry home.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-3xl font-bold text-gold">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sidebar py-20">
        <div className="container-page">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              What Guides Us
            </span>
            <h2 className="mt-3 font-heading text-3xl font-semibold">Our Values</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-card p-7 shadow-soft"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-gold/15 text-gold">
                  <v.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20 text-center">
        <Mountain className="mx-auto size-8 text-gold" />
        <p className="mx-auto mt-6 max-w-2xl font-heading text-2xl leading-relaxed">
          “{HOTEL.tagline}. We invite you to slow down, breathe deeply, and rediscover
          what it means to truly rest.”
        </p>
      </section>
    </>
  );
}
