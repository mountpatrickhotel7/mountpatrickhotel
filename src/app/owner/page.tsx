import Link from "next/link";
import {
  Wallet,
  Percent,
  CalendarDays,
  UserX,
  Users,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard, DashboardTitle } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/owner/revenue-chart";
import { getAnalytics } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";

export const metadata = { title: "Owner Analytics" };

export default async function OwnerDashboardPage() {
  const a = await getAnalytics();

  return (
    <>
      <DashboardTitle
        title="Estate Overview"
        description="Revenue, occupancy, and performance across Mount Patrick."
        action={
          <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90">
            <Link href="/owner/reports">Generate reports</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue (month)" value={formatCurrency(a.revenue.month)} icon={Wallet} accent hint={`${formatCurrency(a.revenue.year)} this year`} />
        <StatCard label="Occupancy" value={`${a.occupancyRate.toFixed(1)}%`} icon={Percent} accent />
        <StatCard label="Total bookings" value={a.bookings.total} icon={CalendarDays} hint={`${a.bookings.confirmed} confirmed`} />
        <StatCard label="No-shows" value={a.bookings.noShow} icon={UserX} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Revenue Trend</h2>
            <span className="text-xs text-muted-foreground">Last 6 months</span>
          </div>
          <RevenueChart data={a.monthly} />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="flex items-center gap-2 font-heading font-semibold">
              <TrendingUp className="size-4 text-gold" /> Forecast
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">Upcoming reservations</p>
            <p className="font-heading text-2xl font-bold">{a.forecast.upcoming}</p>
            <p className="mt-2 text-sm text-muted-foreground">Expected revenue</p>
            <p className="font-heading text-2xl font-bold text-gold">
              {formatCurrency(a.forecast.expectedRevenue)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="flex items-center gap-2 font-heading font-semibold">
              <Users className="size-4 text-gold" /> Customers
            </h3>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Unique guests</span>
              <span className="font-semibold">{a.customers.total}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Occupancy breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-heading text-lg font-semibold">Room Status</h2>
          <div className="mt-4 space-y-3">
            {[
              ["Available", a.rooms.available, "bg-emerald-500"],
              ["Reserved", a.rooms.reserved, "bg-amber-500"],
              ["Occupied", a.rooms.occupied, "bg-blue-500"],
              ["Cleaning", a.rooms.cleaning, "bg-violet-500"],
              ["Maintenance", a.rooms.maintenance, "bg-orange-500"],
            ].map(([label, value, color]) => {
              const pct = a.rooms.total ? (Number(value) / a.rooms.total) * 100 : 0;
              return (
                <div key={label as string}>
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top rooms */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
            <Trophy className="size-4 text-gold" /> Top Performing Rooms
          </h2>
          <div className="mt-4 space-y-3">
            {a.topRooms.length === 0 && (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            )}
            {a.topRooms.map((r, i) => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="flex items-center gap-3 text-sm">
                  <span className="grid size-6 place-items-center rounded-full bg-gold/15 text-xs font-bold text-gold">
                    {i + 1}
                  </span>
                  {r.label}
                </span>
                <span className="text-sm">
                  <span className="font-semibold">{r.bookings}</span>
                  <span className="text-muted-foreground"> · {formatCurrency(r.revenue)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
