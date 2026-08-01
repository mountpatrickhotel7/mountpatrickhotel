"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Brand } from "@/components/brand";
import { PUBLIC_NAV } from "@/lib/constants";

export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle asChild>
            <Brand href="/" />
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-2 flex flex-col gap-1 px-4">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            {!signedIn && (
              <Button asChild variant="outline" onClick={() => setOpen(false)}>
                <Link href="/login">Sign in</Link>
              </Button>
            )}
            <Button
              asChild
              className="bg-gold text-gold-foreground hover:bg-gold/90"
              onClick={() => setOpen(false)}
            >
              <Link href="/rooms">Book now</Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
