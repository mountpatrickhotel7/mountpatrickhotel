import { AllBookings } from "@/components/reception/all-bookings";

export const metadata = { title: "Reservations" };

export default async function ReceptionBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  return <AllBookings basePath="/reception/bookings" status={status} />;
}
