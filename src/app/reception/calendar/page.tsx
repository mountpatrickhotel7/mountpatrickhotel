import { CalendarView } from "@/components/reception/calendar-view";

export const metadata = { title: "Room Calendar" };

export default async function ReceptionCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; days?: string }>;
}) {
  const sp = await searchParams;
  return (
    <CalendarView basePath="/reception/calendar" startParam={sp.start} daysParam={sp.days} />
  );
}
