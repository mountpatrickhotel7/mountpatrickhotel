import { CalendarView } from "@/components/reception/calendar-view";

export const metadata = { title: "Room Calendar" };

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; days?: string }>;
}) {
  const sp = await searchParams;
  return (
    <CalendarView basePath="/admin/calendar" startParam={sp.start} daysParam={sp.days} />
  );
}
