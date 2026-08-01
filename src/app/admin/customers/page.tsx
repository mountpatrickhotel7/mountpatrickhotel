import { Users } from "lucide-react";
import { DashboardTitle } from "@/components/dashboard/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata = { title: "Customers" };

interface Customer {
  phone: string;
  name: string;
  email: string | null;
  bookings: number;
  value: number;
  lastStay: string;
  registered: boolean;
}

const COUNTED = ["Confirmed", "Checked-In", "Checked-Out", "Reserved"];

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("guest_name, guest_phone, guest_email, total_amount, check_out, status, source, guest_id")
    .order("check_out", { ascending: false })
    .limit(1000);

  type B = {
    guest_name: string | null;
    guest_phone: string | null;
    guest_email: string | null;
    total_amount: number;
    check_out: string;
    status: string;
    source: string;
    guest_id: string | null;
  };
  const bookings = (data ?? []) as unknown as B[];

  // Aggregate distinct customers by phone (covers both online + walk-in guests).
  const map = new Map<string, Customer>();
  for (const b of bookings) {
    const phone = b.guest_phone?.trim();
    if (!phone) continue;
    const existing = map.get(phone);
    const counts = COUNTED.includes(b.status);
    if (existing) {
      existing.bookings += 1;
      if (counts) existing.value += Number(b.total_amount);
      if (!existing.email && b.guest_email) existing.email = b.guest_email;
      if (b.guest_id) existing.registered = true;
      // rows are sorted by check_out desc, so the first seen is the latest
    } else {
      map.set(phone, {
        phone,
        name: b.guest_name ?? "Guest",
        email: b.guest_email,
        bookings: 1,
        value: counts ? Number(b.total_amount) : 0,
        lastStay: b.check_out,
        registered: !!b.guest_id,
      });
    }
  }
  const customers = [...map.values()].sort(
    (a, b) => new Date(b.lastStay).getTime() - new Date(a.lastStay).getTime()
  );

  return (
    <>
      <DashboardTitle
        title="Customers"
        description="Everyone who has booked or stayed — online guests and walk-ins."
      />
      {customers.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Users className="size-9 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No customers yet. They&apos;ll appear here once guests book or check in.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Last stay</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.phone}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.email ?? "—"}</TableCell>
                  <TableCell>{c.bookings}</TableCell>
                  <TableCell>{formatCurrency(c.value)}</TableCell>
                  <TableCell>{formatDate(c.lastStay)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        c.registered
                          ? "bg-gold/15 text-gold"
                          : "bg-accent text-accent-foreground"
                      }
                    >
                      {c.registered ? "Registered" : "Walk-in"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
