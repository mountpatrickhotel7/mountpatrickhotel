"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/bookings", label: "My Bookings", icon: CalendarCheck },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 md:flex-col">
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/70 hover:bg-accent hover:text-foreground"
            )}
          >
            <l.icon className="size-4" /> {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
