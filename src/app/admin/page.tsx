import Link from "next/link";
import { BedDouble, CalendarDays, Wallet, Percent, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard, DashboardTitle } from "@/components/dashboard/stat-card";
import { getAnalytics } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";

export const metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const a = await getAnalytics();

  return (
    <>
      <DashboardTitle
        title="Overview"
        description="A snapshot of the property today."
        action={
          <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90">
            <Link href="/admin/rooms"><Plus className="size-4" /> Manage rooms</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Revenue this month" value={formatCurrency(a.revenue.month)} icon={Wallet} accent hint={`${formatCurrency(a.revenue.today)} today`} />
        <StatCard label="Occupancy" value={`${a.occupancyRate.toFixed(1)}%`} icon={Percent} accent />
        <StatCard label="Total bookings" value={a.bookings.total} icon={CalendarDays} hint={`${a.bookings.checkedIn} in-house`} />
        <StatCard label="Rooms available" value={`${a.rooms.available}/${a.rooms.total}`} icon={BedDouble} />
        <StatCard label="Occupied / reserved" value={`${a.rooms.occupied} / ${a.rooms.reserved}`} icon={BedDouble} />
        <StatCard label="Customers" value={a.customers.total} icon={Users} hint="unique guests" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin/rooms", label: "Rooms" },
          { href: "/admin/bookings", label: "Reservations" },
          { href: "/admin/customers", label: "Customers" },
          { href: "/owner", label: "Analytics & Reports" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-2xl border border-border bg-card p-5 font-heading font-semibold shadow-soft transition-colors hover:border-gold"
          >
            {l.label} →
          </Link>
        ))}
      </div>
    </>
  );
}
