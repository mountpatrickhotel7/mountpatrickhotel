import "server-only";
import { createClient } from "@/lib/supabase/server";
import { toISODate } from "@/lib/format";

export interface Analytics {
  rooms: {
    total: number;
    available: number;
    reserved: number;
    occupied: number;
    cleaning: number;
    maintenance: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    noShow: number;
    checkedIn: number;
  };
  revenue: { today: number; week: number; month: number; year: number; total: number };
  occupancyRate: number;
  monthly: { month: string; revenue: number }[];
  topRooms: { label: string; bookings: number; revenue: number }[];
  customers: { total: number };
  forecast: { upcoming: number; expectedRevenue: number };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getAnalytics(): Promise<Analytics> {
  const supabase = await createClient();
  const now = new Date();
  const today = toISODate(now);
  const startOfWeek = toISODate(new Date(now.getTime() - 6 * 86400_000));
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const startOfYear = `${now.getFullYear()}-01-01`;

  const [{ data: roomsData }, { data: bookingsData }, { data: paymentsData }] =
    await Promise.all([
      supabase.from("rooms").select("status"),
      supabase.from("bookings").select("status, room_id, total_amount, check_in, guest_phone, rooms(room_number, room_type)"),
      supabase.from("booking_payments").select("amount, paid_at, status").eq("status", "success"),
    ]);

  const rooms = (roomsData ?? []) as { status: string }[];
  const countRoom = (s: string) => rooms.filter((r) => r.status === s).length;
  const roomStats = {
    total: rooms.length,
    available: countRoom("Available"),
    reserved: countRoom("Reserved"),
    occupied: countRoom("Occupied"),
    cleaning: countRoom("Cleaning"),
    maintenance: countRoom("Maintenance"),
  };

  type BookingRow = {
    status: string;
    room_id: string;
    total_amount: number;
    check_in: string;
    guest_phone: string | null;
    rooms?: { room_number: string; room_type: string } | null;
  };
  const bookings = (bookingsData ?? []) as unknown as BookingRow[];
  const customerCount = new Set(
    bookings.map((b) => b.guest_phone?.trim()).filter(Boolean)
  ).size;
  const countStatus = (s: string) => bookings.filter((b) => b.status === s).length;
  const bookingStats = {
    total: bookings.length,
    pending: countStatus("Pending") + countStatus("Awaiting Payment"),
    confirmed: countStatus("Confirmed") + countStatus("Reserved"),
    cancelled: countStatus("Cancelled"),
    noShow: countStatus("No Show"),
    checkedIn: countStatus("Checked-In"),
  };

  const payments = (paymentsData ?? []) as { amount: number; paid_at: string | null }[];
  const sumSince = (since: string) =>
    payments
      .filter((p) => p.paid_at && p.paid_at.slice(0, 10) >= since)
      .reduce((s, p) => s + Number(p.amount), 0);
  const revenue = {
    today: sumSince(today),
    week: sumSince(startOfWeek),
    month: sumSince(startOfMonth),
    year: sumSince(startOfYear),
    total: payments.reduce((s, p) => s + Number(p.amount), 0),
  };

  // Monthly revenue series (last 6 months)
  const monthly: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const rev = payments
      .filter((p) => p.paid_at && p.paid_at.slice(0, 7) === key)
      .reduce((s, p) => s + Number(p.amount), 0);
    monthly.push({ month: MONTHS[d.getMonth()], revenue: rev });
  }

  // Top rooms by bookings
  const roomAgg = new Map<string, { label: string; bookings: number; revenue: number }>();
  for (const b of bookings) {
    if (b.status === "Cancelled" || b.status === "No Show") continue;
    const label = b.rooms ? `${b.rooms.room_type} · ${b.rooms.room_number}` : "Unknown";
    const cur = roomAgg.get(b.room_id) ?? { label, bookings: 0, revenue: 0 };
    cur.bookings += 1;
    cur.revenue += Number(b.total_amount);
    roomAgg.set(b.room_id, cur);
  }
  const topRooms = [...roomAgg.values()].sort((a, b) => b.bookings - a.bookings).slice(0, 5);

  const occupancyRate = roomStats.total
    ? ((roomStats.occupied + roomStats.reserved) / roomStats.total) * 100
    : 0;

  // Forecast: upcoming confirmed/reserved arrivals & their value
  const upcoming = bookings.filter(
    (b) => ["Reserved", "Confirmed"].includes(b.status) && b.check_in >= today
  );
  const forecast = {
    upcoming: upcoming.length,
    expectedRevenue: upcoming.reduce((s, b) => s + Number(b.total_amount), 0),
  };

  return {
    rooms: roomStats,
    bookings: bookingStats,
    revenue,
    occupancyRate,
    monthly,
    topRooms,
    customers: {
      total: customerCount ?? 0,
    },
    forecast,
  };
}
