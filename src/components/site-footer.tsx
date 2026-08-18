import Link from "next/link";
import { Mail, Phone, MapPin, AtSign, Share2, Send } from "lucide-react";
import { Brand } from "@/components/brand";
import { HOTEL, PUBLIC_NAV } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-sidebar">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Brand />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            {HOTEL.description}
          </p>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            <Link href={HOTEL.social.instagram} aria-label="Instagram" className="hover:text-gold">
              <AtSign className="size-5" />
            </Link>
            <Link href={HOTEL.social.facebook} aria-label="Facebook" className="hover:text-gold">
              <Share2 className="size-5" />
            </Link>
            <Link href={HOTEL.social.twitter} aria-label="Twitter" className="hover:text-gold">
              <Send className="size-5" />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-heading text-sm font-semibold">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm font-semibold">Guest</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link href="/account" className="hover:text-foreground">My account</Link></li>
            <li><Link href="/account/bookings" className="hover:text-foreground">My bookings</Link></li>
            <li><Link href="/login" className="hover:text-foreground">Sign in</Link></li>
            <li><Link href="/faq" className="hover:text-foreground">Help & FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm font-semibold">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" /> {HOTEL.address}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-gold" /> {HOTEL.phone}
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-gold" /> {HOTEL.email}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {HOTEL.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <p>Check-in {HOTEL.checkInTime} · Check-out {HOTEL.checkOutTime}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
