import { AllBookings } from "@/components/reception/all-bookings";

export const metadata = { title: "Reservations" };

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return <AllBookings basePath="/admin/bookings" status={status} />;
}
