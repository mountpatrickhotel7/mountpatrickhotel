import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Utensils,
  Cross,
  Landmark,
  Fuel,
  Trees,
  ShoppingBag,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { HOTEL } from "@/lib/constants";

export const metadata = { title: "Contact" };

const NEARBY = [
  { icon: Trees, label: "Tourist Attractions", items: ["Lake Bosomtwe (~30 km)", "Manhyia Palace Museum (8 km)"] },
  { icon: Utensils, label: "Restaurants", items: ["Kumasi City Mall food court (2 km)", "Asokwa eateries (3 km)"] },
  { icon: Cross, label: "Hospitals", items: ["Kumasi South Hospital, Atonsu (1 km)", "Komfo Anokye Teaching Hospital (7 km)"] },
  { icon: Landmark, label: "Banks & ATMs", items: ["GCB Bank Atonsu (1 km)", "Ecobank Asokwa (2 km)"] },
  { icon: Fuel, label: "Fuel Stations", items: ["GOIL Atonsu (1 km)", "Shell Lake Road (2 km)"] },
  { icon: ShoppingBag, label: "Shopping", items: ["Kumasi City Mall (2 km)", "Atonsu Market (1 km)"] },
];

export default function ContactPage() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    HOTEL.mapQuery
  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <>
      <PageHeader
        eyebrow="Get in Touch"
        title="Contact & Location"
        description="We'd love to help you plan your stay. Reach out, or find your way to us in Atonsu, Kumasi."
      />

      <section className="container-page grid gap-12 py-16 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-2xl font-semibold">Send us a message</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our concierge team typically responds within a few hours.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: MapPin, title: "Address", value: HOTEL.address },
            { icon: Phone, title: "Phone", value: HOTEL.phone },
            { icon: Mail, title: "Email", value: HOTEL.email },
            { icon: Clock, title: "Reception", value: `Check-in ${HOTEL.checkInTime} · Check-out ${HOTEL.checkOutTime} · Open 24/7` },
          ].map((c) => (
            <div
              key={c.title}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                <c.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-heading font-semibold">{c.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Map */}
      <section className="container-page pb-16">
        <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
          <iframe
            title="Mount Patrick Hotel location"
            src={mapSrc}
            className="h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* Nearby */}
      <section className="bg-sidebar py-16">
        <div className="container-page">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              The Neighbourhood
            </span>
            <h2 className="mt-3 font-heading text-3xl font-semibold">Nearby Attractions</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {NEARBY.map((n) => (
              <div
                key={n.label}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-gold/15 text-gold">
                  <n.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-heading font-semibold">{n.label}</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {n.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
