import "server-only";
import { createClient } from "@/lib/supabase/server";
import { periodRange, type ReportType } from "@/lib/report-period";
import type { ReportData, ReportRow } from "@/lib/services/pdf";

export { periodRange, type ReportType };

export async function buildReport(
  type: ReportType,
  dateStr: string
): Promise<ReportData> {
  const supabase = await createClient();
  const { start, end, label } = periodRange(type, dateStr);

  const { data: bookingsData } = await supabase
    .from("bookings")
    .select("check_in, check_out, guest_name, total_amount, status, created_at, rooms(room_number)")
    .gte("check_in", start)
    .lte("check_in", end)
    .order("check_in", { ascending: true });

  type Row = {
    check_in: string;
    check_out: string;
    guest_name: string | null;
    total_amount: number;
    status: string;
    rooms?: { room_number: string } | null;
  };
  const bookings = (bookingsData ?? []) as unknown as Row[];

  const rows: ReportRow[] = bookings.map((b) => ({
    date: b.check_in,
    roomNumber: b.rooms?.room_number ?? "—",
    guestName: b.guest_name ?? "Guest",
    checkIn: b.check_in,
    checkOut: b.check_out,
    amountPaid: Number(b.total_amount),
    status: b.status,
  }));

  // Revenue from successful payments in the period
  const { data: paymentsData } = await supabase
    .from("booking_payments")
    .select("amount, paid_at, status")
    .eq("status", "success")
    .gte("paid_at", `${start}T00:00:00`)
    .lte("paid_at", `${end}T23:59:59`);
  const payments = (paymentsData ?? []) as { amount: number }[];
  const revenue = payments.reduce((s, p) => s + Number(p.amount), 0);

  // Occupancy: distinct rooms booked in period / total active rooms
  const { count: totalRooms } = await supabase
    .from("rooms")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);
  const bookedRooms = new Set(
    bookings
      .filter((b) => !["Cancelled", "No Show"].includes(b.status))
      .map((b) => b.rooms?.room_number)
      .filter(Boolean)
  );
  const occupancyRate = totalRooms ? (bookedRooms.size / totalRooms) * 100 : 0;

  return {
    title: `${type[0].toUpperCase()}${type.slice(1)} Report`,
    periodLabel: label,
    rows,
    totalBookings: rows.length,
    revenue,
    occupancyRate,
  };
}
