import { DashboardShell } from "@/components/dashboard/shell";
import { requireRole } from "@/lib/auth";

export default async function ReceptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["receptionist", "admin", "owner"]);
  return (
    <DashboardShell area="reception" profile={profile}>
      {children}
    </DashboardShell>
  );
}
