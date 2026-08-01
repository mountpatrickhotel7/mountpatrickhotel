"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  CalendarRange,
  Users,
  ScanLine,
  UserPlus,
  Settings,
  BarChart3,
  FileText,
  ConciergeBell,
  Menu,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { IconName, NavItem } from "@/lib/dashboard-nav";

const ICONS: Record<IconName, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  bed: BedDouble,
  calendar: CalendarDays,
  calendarGrid: CalendarRange,
  users: Users,
  scan: ScanLine,
  walkin: UserPlus,
  settings: Settings,
  chart: BarChart3,
  report: FileText,
  concierge: ConciergeBell,
};

function NavLinks({
  nav,
  switcher,
  areaLabel,
  onNavigate,
}: {
  nav: NavItem[];
  switcher: { href: string; label: string }[];
  areaLabel: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Brand />
        <p className="mt-1 pl-11 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
          {areaLabel}
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const Icon = ICONS[item.icon];
          const active =
            pathname === item.href ||
            (item.href !== "/reception" &&
              item.href !== "/admin" &&
              item.href !== "/owner" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-4.5" /> {item.label}
            </Link>
          );
        })}
      </nav>
      {switcher.length > 1 && (
        <div className="border-t border-sidebar-border p-3">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Switch area
          </p>
          {switcher.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              onClick={onNavigate}
              className="block rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

type SidebarProps = {
  nav: NavItem[];
  switcher: { href: string; label: string }[];
  areaLabel: string;
};

export function DesktopSidebar({ nav, switcher, areaLabel }: SidebarProps) {
  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-sidebar-border bg-sidebar md:block">
      <div className="sticky top-0 h-dvh overflow-y-auto">
        <NavLinks nav={nav} switcher={switcher} areaLabel={areaLabel} />
      </div>
    </aside>
  );
}

export function MobileSidebar({ nav, switcher, areaLabel }: SidebarProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] bg-sidebar p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <NavLinks
          nav={nav}
          switcher={switcher}
          areaLabel={areaLabel}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
