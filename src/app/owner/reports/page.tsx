import { DashboardTitle } from "@/components/dashboard/stat-card";
import { ReportGenerator } from "@/components/owner/report-generator";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <>
      <DashboardTitle
        title="Reports"
        description="Generate daily, weekly, and monthly reports as PDF, Excel, or CSV."
      />
      <ReportGenerator />
      <div className="mt-6 max-w-xl rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
        Reports include each booking&apos;s date, room, guest, check-in/out, amount paid,
        and status, with a summary of total bookings, revenue, and occupancy for the
        period.
      </div>
    </>
  );
}
